import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";
import { getFallbackCategoryId, suggestCategoryId } from "../services/categorization.service";
import { resolveMonthRange } from "../services/budget.service";

export const transactionsRouter = Router();

const createSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().default(""),
  date: z.coerce.date().optional(),
  categoryId: z.string().min(1).optional(),
});

transactionsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const month = req.query.month as string | undefined;
    const { start, end } = resolveMonthRange(month);
    const transactions = await prisma.transaction.findMany({
      where: { type: "variable", date: { gte: start, lt: end } },
      include: { category: true },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  })
);

transactionsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    let categoryId = data.categoryId;
    if (!categoryId) {
      categoryId = (await suggestCategoryId(data.description)) ?? (await getFallbackCategoryId());
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        description: data.description,
        date: data.date ?? new Date(),
        type: "variable",
        source: "manual",
        categoryId,
      },
      include: { category: true },
    });

    res.status(201).json(transaction);
  })
);

const updateSchema = z.object({
  amount: z.number().int().positive().optional(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  categoryId: z.string().min(1).optional(),
});

transactionsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, "Transacción no encontrada");

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });
    res.json(transaction);
  })
);

transactionsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!transaction) throw new ApiError(404, "Transacción no encontrada");
    await prisma.transaction.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
