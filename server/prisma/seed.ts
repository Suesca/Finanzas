import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES: { name: string; type: "income" | "fixed" | "variable" | "savings" | "debt"; icon: string }[] = [
  { name: "Salario", type: "income", icon: "💼" },
  { name: "Otros ingresos", type: "income", icon: "💰" },
  { name: "Arriendo", type: "fixed", icon: "🏠" },
  { name: "Servicios públicos", type: "fixed", icon: "💡" },
  { name: "Internet", type: "fixed", icon: "📶" },
  { name: "Suscripciones", type: "fixed", icon: "🔁" },
  { name: "Seguro", type: "fixed", icon: "🛡️" },
  { name: "Café", type: "variable", icon: "☕" },
  { name: "Panadería", type: "variable", icon: "🥖" },
  { name: "Comida rápida", type: "variable", icon: "🍔" },
  { name: "Mercado", type: "variable", icon: "🛒" },
  { name: "Transporte", type: "variable", icon: "🚌" },
  { name: "Ocio", type: "variable", icon: "🎉" },
  { name: "Salud", type: "variable", icon: "💊" },
  { name: "Otros", type: "variable", icon: "💸" },
  { name: "Ahorro", type: "savings", icon: "🐷" },
  { name: "Pago de deuda", type: "debt", icon: "💳" },
];

const QUICK_TEMPLATES: { label: string; emoji: string; categoryName: string; defaultAmount?: number }[] = [
  { label: "Tinto", emoji: "☕", categoryName: "Café", defaultAmount: 2000 },
  { label: "Pan", emoji: "🥖", categoryName: "Panadería", defaultAmount: 3000 },
  { label: "Empanada", emoji: "🥟", categoryName: "Comida rápida", defaultAmount: 3000 },
  { label: "Bus", emoji: "🚌", categoryName: "Transporte" },
  { label: "Uber", emoji: "🚗", categoryName: "Transporte" },
  { label: "Almuerzo", emoji: "🍽️", categoryName: "Comida rápida" },
  { label: "Mercado", emoji: "🛒", categoryName: "Mercado" },
  { label: "Otro", emoji: "💸", categoryName: "Otros" },
];

async function main() {
  const pin = process.env.AUTH_PIN || "123456";
  const pinHash = await bcrypt.hash(pin, 10);

  const existingUser = await prisma.user.findFirst();
  if (!existingUser) {
    await prisma.user.create({ data: { pinHash } });
    console.log("Usuario creado con el PIN definido en AUTH_PIN.");
  } else {
    await prisma.user.update({ where: { id: existingUser.id }, data: { pinHash } });
    console.log("PIN del usuario actualizado según AUTH_PIN.");
  }

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: { name: cat.name, type: cat.type } },
      update: {},
      create: { ...cat, isDefault: true },
    });
  }
  console.log(`Categorías por defecto listas (${DEFAULT_CATEGORIES.length}).`);

  const existingTemplates = await prisma.quickTemplate.count();
  if (existingTemplates === 0) {
    for (let i = 0; i < QUICK_TEMPLATES.length; i++) {
      const t = QUICK_TEMPLATES[i];
      const category = await prisma.category.findFirst({ where: { name: t.categoryName, type: "variable" } });
      if (!category) continue;
      await prisma.quickTemplate.create({
        data: {
          label: t.label,
          emoji: t.emoji,
          defaultAmount: t.defaultAmount,
          categoryId: category.id,
          sortOrder: i,
        },
      });
    }
    console.log("Plantillas rápidas de ejemplo creadas.");
  }

  if (process.env.BANK_PROVIDER !== "belvo") {
    const existingConnection = await prisma.bankConnection.findFirst();
    if (!existingConnection) {
      const connection = await prisma.bankConnection.create({
        data: {
          provider: "mock",
          institutionName: "Davivienda (demo)",
          status: "connected",
          lastSyncedAt: new Date(),
        },
      });
      await prisma.bankAccount.create({
        data: {
          bankConnectionId: connection.id,
          name: "Cuenta de ahorros",
          type: "savings_account",
          balance: 1850000,
          currency: "COP",
          externalId: "mock-account-1",
        },
      });
      console.log("Conexión bancaria mock creada.");
    }
  }

  const existingDebt = await prisma.debt.count();
  if (existingDebt === 0) {
    await prisma.debt.create({
      data: {
        name: "Tarjeta de crédito",
        institution: "Davivienda (demo)",
        totalAmount: 2000000,
        remainingAmount: 950000,
        minPayment: 120000,
        dueDay: 15,
      },
    });
    console.log("Deuda de ejemplo creada.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
