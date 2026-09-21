import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

export const quickTemplatesRouter = Router();

const templateSchema = z.object({
  label: z.string().min(1),
  emoji: z.string().min(1).default("💸"),
  defaultAmount: z.number().int().positive().optional(),
  categoryId: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

quickTemplatesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const templates = await prisma.quickTemplate.findMany({
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json(templates);
  })
);

quickTemplatesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = templateSchema.parse(req.body);
    const template = await prisma.quickTemplate.create({ data, include: { category: true } });
    res.status(201).json(template);
  })
);

quickTemplatesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const template = await prisma.quickTemplate.findUnique({ where: { id: req.params.id } });
    if (!template) throw new ApiError(404, "Plantilla no encontrada");
    await prisma.quickTemplate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
