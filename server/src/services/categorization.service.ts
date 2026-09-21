import { prisma } from "../prisma";
import { suggestCategoryName } from "./keywordRules";

/**
 * Sugiere una categoría "variable" a partir de una descripción libre.
 * Devuelve null si ninguna regla coincide (el llamador debe usar un
 * categoryId explícito o una categoría por defecto como "Otros").
 */
export async function suggestCategoryId(description: string): Promise<string | null> {
  const categoryName = suggestCategoryName(description);
  if (!categoryName) return null;

  const category = await prisma.category.findFirst({
    where: { name: categoryName, type: "variable" },
  });
  return category?.id ?? null;
}

export async function getFallbackCategoryId(): Promise<string> {
  const otros = await prisma.category.findFirst({ where: { name: "Otros", type: "variable" } });
  if (otros) return otros.id;
  const anyVariable = await prisma.category.findFirst({ where: { type: "variable" } });
  if (!anyVariable) throw new Error("No hay categorías 'variable' configuradas. Corre el seed.");
  return anyVariable.id;
}
