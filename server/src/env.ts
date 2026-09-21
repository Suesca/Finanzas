import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "Falta DATABASE_URL"),
  AUTH_PIN: z.string().min(4, "AUTH_PIN debe tener al menos 4 caracteres"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET debe ser largo y aleatorio"),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Independiente de NODE_ENV: la cookie de sesión "Secure" solo la guardan
  // los navegadores/WebViews sobre HTTPS. Para probar en red local por HTTP
  // (ej. la app Android apuntando a http://192.168.x.x:4000) hay que ponerlo
  // en false; en el despliegue real (HTTPS) debe quedar en true.
  // z.coerce.boolean() NO sirve aquí: Boolean("false") es true en JS, así
  // que cualquier string no vacío se volvería true. Se parsea explícito.
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === undefined || (v !== "false" && v !== "0")),
  BANK_PROVIDER: z.enum(["mock", "belvo"]).default("mock"),
  BELVO_SECRET_ID: z.string().optional(),
  BELVO_SECRET_PASSWORD: z.string().optional(),
  BELVO_ENV: z.string().default("sandbox"),
  BANK_SYNC_INTERVAL_HOURS: z.coerce.number().default(6),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno inválidas o faltantes:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
