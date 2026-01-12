"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

/* ---------------- Gemini Setup ---------------- */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});

/* ---------------- Helpers ---------------- */

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

const calculateNextRecurringDate = (date, interval) => {
  const d = new Date(date);
  switch (interval) {
    case "MONTHLY":
      d.setMonth(d.getMonth() + 1);
      break;
    case "YEARLY":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      break;
  }
  return d;
};

/* ---------------- Create Transaction ---------------- */

export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();

    const decision = await aj.protect(req, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findUnique({
      where: { id: data.accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    const balanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

/* ---------------- Get Transaction ---------------- */

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: { id, userId: user.id },
  });
  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

/* ---------------- Update Transaction ---------------- */

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const original = await db.transaction.findUnique({
      where: { id, userId: user.id },
      include: { account: true },
    });
    if (!original) throw new Error("Transaction not found");

    const oldChange =
      original.type === "EXPENSE"
        ? -original.amount.toNumber()
        : original.amount.toNumber();

    const newChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netChange = newChange - oldChange;

    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id, userId: user.id },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: netChange } },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

/* ---------------- Get User Transactions ---------------- */

export async function getUserTransactions(query = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, ...query },
    include: { account: true },
    orderBy: { date: "desc" },
  });

  return { success: true, data: transactions };
}

/* ---------------- Scan Receipt (Gemini-3-Flash-Preview) ---------------- */

export async function scanReceipt(file) {
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const prompt = `
You are a financial assistant for an expense-tracking app.

Extract receipt data.

Rules:
- Currency is INR unless stated
- Date format: YYYY-MM-DD
- Category must be one of:
  housing, transportation, groceries, utilities, entertainment,
  food, shopping, healthcare, education, personal, travel,
  insurance, gifts, bills, other-expense
- If unsure, use "other-expense"
- Return STRICT JSON only

Schema:
{
  "amount": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "merchantName": "string",
  "category": "string"
}

If not a receipt, return {}.
`;

    const result = await geminiFlash.generateContent([
      {
        inlineData: {
          mimeType: file.type || "image/jpeg",
          data: base64,
        },
      },
      { text: prompt },
    ]);

    const raw = result.response.text().replace(/```(?:json)?/g, "").trim();
    if (!raw || raw === "{}") return {};

    const parsed = JSON.parse(raw);

    return {
      amount: Number(parsed.amount),
      date: parsed.date ? new Date(parsed.date) : null,
      description: parsed.description ?? "",
      merchantName: parsed.merchantName ?? "",
      category: parsed.category ?? "other-expense",
    };
  } catch (error) {
    console.error("Receipt scan failed:", error);
    throw new Error("Failed to scan receipt");
  }
}
