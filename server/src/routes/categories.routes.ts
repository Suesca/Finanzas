import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { asyncHandler, ApiError } from "../utils/asyncHandler";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "fixed", "variable", "savings", "debt"]),
  icon: z.string().min(1).default("💸"),
});

categoriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const type = req.query.type as string | undefined;
    const categories = await prisma.category.findMany({
      where: type ? { type: type as any } : undefined,
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
    res.json(categories);
  })
);

categoriesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = categorySchema.parse(req.body);
    const category = await prisma.category.create({ data });
    res.status(201).json(category);
  })
);

categoriesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) throw new ApiError(404, "Categoría no encontrada");
    if (category.isDefault) throw new ApiError(400, "No se pueden eliminar las categorías por defecto");
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);
