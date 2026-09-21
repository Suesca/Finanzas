import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

export const fixedExpensesRouter = Router();

const fixedExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().int().positive(),
  dueDay: z.number().int().min(1).max(31).default(1),
  categoryId: z.string().min(1),
  active: z.boolean().default(true),
});

fixedExpensesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const expenses = await prisma.fixedExpense.findMany({
      include: { category: true },
      orderBy: { dueDay: "asc" },
    });
    res.json(expenses);
  })
);

fixedExpensesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = fixedExpenseSchema.parse(req.body);
    const expense = await prisma.fixedExpense.create({ data, include: { category: true } });
    res.status(201).json(expense);
  })
);

fixedExpensesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = fixedExpenseSchema.partial().parse(req.body);
    const expense = await prisma.fixedExpense.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(expense);
  })
);

fixedExpensesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const expense = await prisma.fixedExpense.findUnique({ where: { id: req.params.id } });
    if (!expense) throw new ApiError(404, "Gasto fijo no encontrado");
    await prisma.fixedExpense.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
