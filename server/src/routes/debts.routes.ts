import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

export const debtsRouter = Router();

const debtSchema = z.object({
  name: z.string().min(1),
  institution: z.string().min(1),
  totalAmount: z.number().int().positive(),
  remainingAmount: z.number().int().min(0),
  minPayment: z.number().int().min(0),
  dueDay: z.number().int().min(1).max(31).default(1),
});

debtsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const debts = await prisma.debt.findMany({ orderBy: { dueDay: "asc" } });
    res.json(debts);
  })
);

debtsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = debtSchema.parse(req.body);
    const debt = await prisma.debt.create({ data });
    res.status(201).json(debt);
  })
);

debtsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = debtSchema.partial().parse(req.body);
    const debt = await prisma.debt.update({ where: { id: req.params.id }, data });
    res.json(debt);
  })
);

debtsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const debt = await prisma.debt.findUnique({ where: { id: req.params.id } });
    if (!debt) throw new ApiError(404, "Deuda no encontrada");
    await prisma.debt.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
