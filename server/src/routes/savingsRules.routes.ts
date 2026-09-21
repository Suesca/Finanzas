import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

export const savingsRulesRouter = Router();

const ruleSchema = z.object({
  mode: z.enum(["fixed", "percentage"]),
  value: z.number().int().positive(),
  active: z.boolean().default(true),
});

savingsRulesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rules = await prisma.savingsRule.findMany({ orderBy: { createdAt: "desc" } });
    res.json(rules);
  })
);

savingsRulesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = ruleSchema.parse(req.body);
    // Solo una regla activa a la vez: simplifica el cálculo de "restante".
    if (data.active) {
      await prisma.savingsRule.updateMany({ where: { active: true }, data: { active: false } });
    }
    const rule = await prisma.savingsRule.create({ data });
    res.status(201).json(rule);
  })
);

savingsRulesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = ruleSchema.partial().parse(req.body);
    if (data.active) {
      await prisma.savingsRule.updateMany({ where: { active: true }, data: { active: false } });
    }
    const rule = await prisma.savingsRule.update({ where: { id: req.params.id }, data });
    res.json(rule);
  })
);

savingsRulesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const rule = await prisma.savingsRule.findUnique({ where: { id: req.params.id } });
    if (!rule) throw new ApiError(404, "Regla no encontrada");
    await prisma.savingsRule.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
