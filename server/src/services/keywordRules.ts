// Reglas de categorización por palabra clave (español colombiano).
// La clave es el nombre de la categoría "variable" y el valor, palabras que,
// si aparecen en la descripción de una transacción, sugieren esa categoría.
export const KEYWORD_RULES: Record<string, string[]> = {
  Café: ["tinto", "cafe", "café", "starbucks", "juan valdez"],
  Panadería: ["pan", "panaderia", "panadería", "pastel", "ponque"],
  "Comida rápida": [
    "empanada",
    "almuerzo",
    "hamburguesa",
    "burger",
    "pizza",
    "comida",
    "restaurante",
    "corrientazo",
    "rappi",
  ],
  Mercado: ["mercado", "supermercado", "exito", "éxito", "carulla", "d1", "ara", "jumbo"],
  Transporte: ["bus", "transmilenio", "uber", "didi", "taxi", "gasolina", "parqueadero", "peaje", "sitp"],
  Ocio: ["cine", "netflix", "spotify", "bar", "cerveza", "concierto", "salida"],
  Salud: ["farmacia", "droguería", "drogueria", "eps", "medico", "médico", "cruz verde", "farmatodo"],
};

export function suggestCategoryName(description: string): string | null {
  const normalized = description.toLowerCase();
  for (const [categoryName, keywords] of Object.entries(KEYWORD_RULES)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return categoryName;
    }
  }
  return null;
}
