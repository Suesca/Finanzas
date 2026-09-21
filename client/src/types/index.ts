export type CategoryType = "income" | "fixed" | "variable" | "savings" | "debt";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  isDefault: boolean;
}

export interface QuickTemplate {
  id: string;
  label: string;
  emoji: string;
  defaultAmount: number | null;
  categoryId: string;
  category: Category;
  sortOrder: number;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: number;
  dueDay: number;
  categoryId: string;
  category: Category;
  active: boolean;
}

export interface SavingsRule {
  id: string;
  mode: "fixed" | "percentage";
  value: number;
  active: boolean;
}

export interface Debt {
  id: string;
  name: string;
  institution: string;
  totalAmount: number;
  remainingAmount: number;
  minPayment: number;
  dueDay: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "variable" | "savings" | "debt_payment";
  source: "manual" | "bank";
  categoryId: string;
  category: Category;
}

export interface BudgetSummary {
  month: string;
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  totalSavings: number;
  remaining: number;
  totalDebt: number;
  upcomingDebtPayments: { id: string; name: string; institution: string; minPayment: number; dueDay: number }[];
  variableByCategory: { categoryId: string; categoryName: string; icon: string; total: number }[];
}

export interface BankAccount {
  id: string;
  bankConnectionId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface BankConnection {
  id: string;
  provider: string;
  institutionName: string;
  status: "connected" | "error" | "syncing";
  lastSyncedAt: string | null;
  lastError: string | null;
  accounts: BankAccount[];
}
