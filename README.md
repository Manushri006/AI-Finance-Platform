# AI Finance Platform

A modern, full-featured personal finance management application with AI-powered insights, automated receipt scanning, and intelligent budget tracking.

## 🌟 Features

### Core Financial Management
- **Multi-Account Support**: Manage multiple bank accounts and credit cards in one unified dashboard
- **Account Types**: Support for CURRENT and SAVINGS account types
- **Transaction Tracking**: Record income and expense transactions with detailed categorization
- **Real-time Balance Updates**: Automatic balance management across all accounts
- **Transaction Filtering**: Filter transactions by type, category, and recurring status

### 🤖 AI-Powered Features
- **Smart Receipt Scanner**: AI-powered receipt scanning using Google Gemini 3-Flash to automatically extract:
  - Transaction amount
  - Merchant name
  - Transaction date
  - Automatic category classification
  - File size limit: 5MB
- **Financial Insights**: AI-generated monthly financial reports with spending patterns and personalized recommendations
- **Automated Analysis**: AI-powered expense analysis and financial health recommendations

### 💰 Budget Management
- **Budget Creation & Tracking**: Set monthly spending budgets for your default account
- **Visual Progress Tracking**: Real-time budget progress visualization
- **Smart Alerts**: Automatic email notifications when spending reaches 80% of budget threshold
- **Monthly Alerts**: One alert per month to avoid notification fatigue
- **Budget Analytics**: Track spending trends and budget adherence

### 🔄 Recurring Transactions
- **Automated Processing**: Automatically create recurring transactions on schedule
- **Flexible Intervals**: Support for DAILY, WEEKLY, MONTHLY, and YEARLY recurring transactions
- **Smart Scheduling**: Automatic calculation of next recurring dates
- **Bulk Management**: Manage multiple recurring transactions efficiently
- **Status Tracking**: PENDING, COMPLETED, and FAILED transaction statuses

### 📧 Email Notifications
- **Monthly Reports**: Automated monthly financial reports with:
  - Income and expense summaries
  - Category-wise spending breakdown
  - AI-generated spending insights
- **Budget Alerts**: Real-time budget threshold notifications
- **Professional Templates**: React Email-based responsive email templates

### 📊 Analytics & Dashboards
- **Dashboard Overview**: Comprehensive financial overview with account summaries
- **Transaction Overview**: Visual representation of spending patterns
- **Category Analytics**: Breakdown of expenses by category
- **Recurring Transaction Tracking**: Easy identification of recurring expenses
- **Account-specific Insights**: Detailed analytics for each account

### 🔐 Security
- **User Authentication**: Secure authentication via Clerk
- **Data Encryption**: PostgreSQL database with secure data storage
- **Rate Limiting**: Arcjet integration for API protection and rate limiting
- **User Isolation**: Complete data isolation between users with proper authorization

## 🛠 Tech Stack

### Frontend
- **Next.js 15.2**: Modern React framework with server components
- **React 18.3**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Efficient form management
- **Zod**: Type-safe schema validation
- **Recharts**: Data visualization library
- **Radix UI**: Headless UI components
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: ORM for database management
- **PostgreSQL**: Primary database
- **Inngest**: Workflow and background job orchestration

### AI & External Services
- **Google Generative AI (Gemini 3-Flash)**: Receipt scanning and financial insights
- **Clerk**: Authentication and user management
- **Resend**: Email delivery service
- **Arcjet**: API security and rate limiting

### Development Tools
- **Turbopack**: Fast bundler for development
- **ESLint**: Code quality
- **PostCSS**: CSS processing

## 📦 Project Structure

```
ai-finance-platform-main/
├── actions/                 # Server actions for data operations
│   ├── dashboard.js        # Dashboard data fetching
│   ├── transaction.js      # Transaction operations & receipt scanning
│   ├── budget.js           # Budget management
│   ├── account.js          # Account management
│   └── send-email.js       # Email sending
├── app/
│   ├── (auth)/             # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (main)/             # Protected routes
│   │   ├── dashboard/      # Dashboard page with overview
│   │   ├── account/[id]/   # Account details page
│   │   ├── transaction/    # Transaction creation
│   │   └── _components/    # Page-specific components
│   ├── api/
│   │   ├── inngest/        # Background job endpoint
│   │   └── seed/           # Database seeding
│   └── layout.js           # Root layout
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI components (Radix-based)
│   ├── create-account-drawer.jsx
│   ├── header.jsx
│   └── hero.jsx
├── lib/
│   ├── prisma.js          # Prisma client
│   ├── arcjet.js          # Security configuration
│   ├── utils.js           # Utility functions
│   ├── inngest/
│   │   ├── client.js      # Inngest client
│   │   └── function.js    # Background job definitions
│   └── schema.js          # Zod schemas
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── emails/                # Email templates
│   └── template.jsx       # React Email templates
├── hooks/
│   └── use-fetch.js       # Custom fetch hook
├── data/
│   ├── categories.js      # Transaction categories
│   └── landing.js         # Landing page data
└── middleware.js          # Next.js middleware

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Google Gemini API key
- Clerk authentication credentials
- Resend API key
- Arcjet API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-finance-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
DIRECT_URL=postgresql://user:password@localhost:5432/finance_db

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI & External Services
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=re_xxxxx
ARCJET_KEY=ajk_xxxxx
```

4. **Setup database**
```bash
npx prisma migrate deploy
npx prisma db seed  # Optional: seed sample data
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📚 Database Schema

### Models
- **User**: Core user with authentication via Clerk
- **Account**: Bank accounts/credit cards with balance tracking
- **Transaction**: Income/expense records with categories and recurring options
- **Budget**: Monthly budget limits with alert tracking

### Enums
- **TransactionType**: INCOME, EXPENSE
- **AccountType**: CURRENT, SAVINGS
- **TransactionStatus**: PENDING, COMPLETED, FAILED
- **RecurringInterval**: DAILY, WEEKLY, MONTHLY, YEARLY

## 🔄 Background Jobs (Inngest)

The application uses Inngest for scheduled and event-driven tasks:

### 1. **Recurring Transactions** (`triggerRecurringTransactions`)
- Cron: Daily at midnight
- Automatically creates new transactions for recurring entries
- Updates account balances
- Calculates next recurring dates

### 2. **Process Recurring Transaction** (`processRecurringTransaction`)
- Event-driven processing
- Throttled: 10 transactions per minute per user
- Creates duplicate transactions and updates balances
- Handles validation and error management

### 3. **Monthly Reports** (`generateMonthlyReports`)
- Cron: First day of each month at midnight
- Generates AI-powered financial insights using Gemini
- Sends detailed monthly reports via email
- Includes spending patterns and recommendations

### 4. **Budget Alerts** (`checkBudgetAlerts`)
- Cron: Every 6 hours
- Monitors budget usage across accounts
- Sends alerts when spending reaches 80% threshold
- Prevents duplicate alerts within the same month

## 🎯 Key Features in Detail

### Receipt Scanner
The receipt scanner uses Google's Gemini 3-Flash model to extract:
- Amount and currency
- Merchant name
- Transaction date
- Automatic category mapping
- Supports up to 5MB image files

**Supported Categories**: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense

### Budget System
- Set monthly budget limits for your default account
- Real-time progress tracking with visual indicators
- Automatic email alerts at 80% threshold
- One alert per calendar month
- Editable budget amounts

### Transaction Management
- **Create**: Add manual transactions or scan receipts
- **Edit**: Modify transaction details
- **Delete**: Remove transactions with bulk operations
- **Filter**: By type (Income/Expense), category, and recurring status
- **Search**: Find transactions by description

### Email Notifications
Templates for:
1. **Monthly Report**: Comprehensive monthly financial summary
2. **Budget Alert**: Budget threshold warning notifications

## 🔐 Security Features

- **Clerk Authentication**: Secure user authentication and management
- **Arcjet Protection**: Rate limiting and API protection
- **Prisma Validation**: Strong type safety with database operations
- **User Isolation**: Complete data separation per user
- **Environment Variables**: Secure credential management
- **CORS & Middleware**: Request validation and filtering

## 📊 Analytics Features

- **Account Dashboard**: Overview of all accounts and balances
- **Transaction Overview**: Visual spending patterns
- **Category Analysis**: Breakdown by expense categories
- **Monthly Insights**: AI-generated financial recommendations
- **Recurring Transaction Tracking**: Easy identification of recurring expenses

## 🔌 API Endpoints

### Authentication
- `/sign-in` - User login
- `/sign-up` - User registration

### Main Routes
- `/dashboard` - Main dashboard
- `/account/[id]` - Account details
- `/transaction/create` - Transaction creation

### API Routes
- `/api/inngest` - Inngest webhook endpoint
- `/api/seed` - Database seeding

## 📝 Usage Examples

### Create a Transaction
```javascript
const result = await createTransaction({
  type: 'EXPENSE',
  amount: '50.00',
  description: 'Grocery shopping',
  date: new Date('2024-01-15'),
  category: 'groceries',
  accountId: 'account-123',
});
```

### Scan a Receipt
```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const scannedData = await scanReceipt(file);
// Returns: { amount, date, description, merchantName, category }
```

### Set a Budget
```javascript
const budget = await createBudget({
  amount: '5000.00',
  userId: 'user-123',
});
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Setup
Ensure all environment variables are set in your production environment:
- Database credentials
- API keys (Clerk, Gemini, Resend, Arcjet)
- Next.js configuration

### Database Migrations
```bash
npx prisma migrate deploy
```