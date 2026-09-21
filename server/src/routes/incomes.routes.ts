import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

export const incomesRouter = Router();

const incomeSchema = z.object({
  description: z.string().min(1),
  amount: z.number().int().positive(),
  date: z.coerce.date().optional(),
  recurring: z.boolean().default(true),
});

incomesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const incomes = await prisma.income.findMany({ orderBy: { date: "desc" } });
    res.json(incomes);
  })
);

incomesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = incomeSchema.parse(req.body);
    const income = await prisma.income.create({ data });
    res.status(201).json(income);
  })
);

incomesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = incomeSchema.partial().parse(req.body);
    const income = await prisma.income.update({ where: { id: req.params.id }, data });
    res.json(income);
  })
);

incomesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const income = await prisma.income.findUnique({ where: { id: req.params.id } });
    if (!income) throw new ApiError(404, "Ingreso no encontrado");
    await prisma.income.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
