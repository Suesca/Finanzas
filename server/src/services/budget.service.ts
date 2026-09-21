import { prisma } from "../prisma";

export interface MonthRange {
  start: Date;
  end: Date;
  key: string; // "YYYY-MM"
}

export function resolveMonthRange(monthParam?: string): MonthRange {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth(); // 0-indexed

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1;
  }

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  return { start, end, key };
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

export async function computeBudgetSummary(monthParam?: string): Promise<BudgetSummary> {
  const { start, end, key } = resolveMonthRange(monthParam);

  const [recurringIncomes, oneTimeIncomes, fixedExpenses, variableTransactions, activeSavingsRule, debts] =
    await Promise.all([
      prisma.income.findMany({ where: { recurring: true } }),
      prisma.income.findMany({ where: { recurring: false, date: { gte: start, lt: end } } }),
      prisma.fixedExpense.findMany({ where: { active: true } }),
      prisma.transaction.findMany({
        where: { type: "variable", date: { gte: start, lt: end } },
        include: { category: true },
      }),
      prisma.savingsRule.findFirst({ where: { active: true } }),
      prisma.debt.findMany(),
    ]);

  const totalIncome =
    recurringIncomes.reduce((sum, i) => sum + i.amount, 0) + oneTimeIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVariable = variableTransactions.reduce((sum, t) => sum + t.amount, 0);

  let totalSavings = 0;
  if (activeSavingsRule) {
    totalSavings =
      activeSavingsRule.mode === "fixed"
        ? activeSavingsRule.value
        : Math.round((activeSavingsRule.value / 100) * totalIncome);
  }

  const remaining = totalIncome - totalFixed - totalVariable - totalSavings;
  const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const upcomingDebtPayments = debts
    .filter((d) => d.remainingAmount > 0)
    .sort((a, b) => a.dueDay - b.dueDay)
    .map((d) => ({ id: d.id, name: d.name, institution: d.institution, minPayment: d.minPayment, dueDay: d.dueDay }));

  const byCategory = new Map<string, { categoryId: string; categoryName: string; icon: string; total: number }>();
  for (const t of variableTransactions) {
    const entry = byCategory.get(t.categoryId) ?? {
      categoryId: t.categoryId,
      categoryName: t.category.name,
      icon: t.category.icon,
      total: 0,
    };
    entry.total += t.amount;
    byCategory.set(t.categoryId, entry);
  }

  return {
    month: key,
    totalIncome,
    totalFixed,
    totalVariable,
    totalSavings,
    remaining,
    totalDebt,
    upcomingDebtPayments,
    variableByCategory: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
  };
}
