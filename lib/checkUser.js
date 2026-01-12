import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0].emailAddress;
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

  const dbUser = await db.user.upsert({
    where: {
      email, // single source of truth
    },
    update: {
      clerkUserId: user.id,
      name,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkUserId: user.id,
      email,
      name,
      imageUrl: user.imageUrl,
    },
  });

  return dbUser;
};
