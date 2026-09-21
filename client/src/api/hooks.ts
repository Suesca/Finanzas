import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import {
  BankConnection,
  BudgetSummary,
  Category,
  Debt,
  FixedExpense,
  Income,
  QuickTemplate,
  SavingsRule,
  Transaction,
} from "../types";

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useDashboardSummary(month: string) {
  return useQuery({
    queryKey: ["dashboard-summary", month],
    queryFn: () => api.get<BudgetSummary>(`/dashboard/summary?month=${month}`),
  });
}

export function useCategories(type?: string) {
  return useQuery({
    queryKey: ["categories", type ?? "all"],
    queryFn: () => api.get<Category[]>(`/categories${type ? `?type=${type}` : ""}`),
  });
}

export function useQuickTemplates() {
  return useQuery({
    queryKey: ["quick-templates"],
    queryFn: () => api.get<QuickTemplate[]>("/quick-templates"),
  });
}

export function useTransactions(month: string) {
  return useQuery({
    queryKey: ["transactions", month],
    queryFn: () => api.get<Transaction[]>(`/transactions?month=${month}`),
  });
}

function useInvalidateBudget() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateBudget();
  return useMutation({
    mutationFn: (data: { amount: number; description: string; categoryId?: string }) =>
      api.post<Transaction>("/transactions", data),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateBudget();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; amount?: number; description?: string; categoryId?: string }) =>
      api.put<Transaction>(`/transactions/${id}`, data),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateBudget();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: invalidate,
  });
}

export function useIncomes() {
  return useQuery({ queryKey: ["incomes"], queryFn: () => api.get<Income[]>("/incomes") });
}

export function useCreateIncome() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { description: string; amount: number; recurring: boolean }) =>
      api.post<Income>("/incomes", data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}

export function useUpdateIncome() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; description?: string; amount?: number; recurring?: boolean }) =>
      api.put<Income>(`/incomes/${id}`, data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}

export function useDeleteIncome() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/incomes/${id}`),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["incomes"] });
    },
  });
}

export function useFixedExpenses() {
  return useQuery({ queryKey: ["fixed-expenses"], queryFn: () => api.get<FixedExpense[]>("/fixed-expenses") });
}

export function useCreateFixedExpense() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { description: string; amount: number; dueDay: number; categoryId: string }) =>
      api.post<FixedExpense>("/fixed-expenses", data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["fixed-expenses"] });
    },
  });
}

export function useUpdateFixedExpense() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      description?: string;
      amount?: number;
      dueDay?: number;
      categoryId?: string;
      active?: boolean;
    }) => api.put<FixedExpense>(`/fixed-expenses/${id}`, data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["fixed-expenses"] });
    },
  });
}

export function useDeleteFixedExpense() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/fixed-expenses/${id}`),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["fixed-expenses"] });
    },
  });
}

export function useSavingsRules() {
  return useQuery({ queryKey: ["savings-rules"], queryFn: () => api.get<SavingsRule[]>("/savings-rules") });
}

export function useCreateSavingsRule() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { mode: "fixed" | "percentage"; value: number; active: boolean }) =>
      api.post<SavingsRule>("/savings-rules", data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["savings-rules"] });
    },
  });
}

export function useUpdateSavingsRule() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; mode?: "fixed" | "percentage"; value?: number; active?: boolean }) =>
      api.put<SavingsRule>(`/savings-rules/${id}`, data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["savings-rules"] });
    },
  });
}

export function useDebts() {
  return useQuery({ queryKey: ["debts"], queryFn: () => api.get<Debt[]>("/debts") });
}

export function useCreateDebt() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Debt, "id">) => api.post<Debt>("/debts", data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useUpdateDebt() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Debt> & { id: string }) => api.put<Debt>(`/debts/${id}`, data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useDeleteDebt() {
  const invalidate = useInvalidateBudget();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/debts/${id}`),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useBankConnections() {
  return useQuery({ queryKey: ["bank-connections"], queryFn: () => api.get<BankConnection[]>("/bank/connections") });
}

export function useSyncBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ ok: true; imported: number }>("/bank/sync"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-connections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
