import { prisma } from "../prisma";
import { getBankProvider } from "../integrations/bankAggregator";
import { BankAggregatorError } from "../integrations/bankAggregator/types";
import { env } from "../env";
import { getFallbackCategoryId, suggestCategoryId } from "./categorization.service";

async function ensureConnection() {
  const existing = await prisma.bankConnection.findFirst();
  if (existing) return existing;

  const provider = getBankProvider();
  const linked = await provider.linkAccount();

  return prisma.bankConnection.create({
    data: {
      provider: provider.name,
      institutionName: linked.institutionName,
      status: "connected",
    },
  });
}

/**
 * Sincroniza cuentas y transacciones desde el proveedor bancario activo.
 * Nunca falla en silencio: cualquier error queda guardado en
 * BankConnection.status/lastError para que la UI lo muestre.
 */
export async function syncBankData() {
  const provider = getBankProvider();
  const connection = await ensureConnection();

  await prisma.bankConnection.update({ where: { id: connection.id }, data: { status: "syncing" } });

  try {
    const accounts = await provider.getAccounts();

    const accountIdByExternalId = new Map<string, string>();
    for (const acc of accounts) {
      const saved = await prisma.bankAccount.upsert({
        where: { bankConnectionId_externalId: { bankConnectionId: connection.id, externalId: acc.externalId } },
        update: { balance: acc.balance, name: acc.name, type: acc.type, currency: acc.currency },
        create: {
          bankConnectionId: connection.id,
          externalId: acc.externalId,
          balance: acc.balance,
          name: acc.name,
          type: acc.type,
          currency: acc.currency,
        },
      });
      accountIdByExternalId.set(acc.externalId, saved.id);
    }

    const transactions = await provider.getTransactions(connection.lastSyncedAt ?? undefined);
    const fallbackCategoryId = await getFallbackCategoryId();

    let imported = 0;
    for (const tx of transactions) {
      const bankAccountId = accountIdByExternalId.get(tx.accountExternalId);
      if (!bankAccountId) continue;

      const alreadyExists = await prisma.transaction.findFirst({
        where: { bankAccountId, source: "bank", description: tx.description, amount: tx.amount, date: new Date(tx.date) },
      });
      if (alreadyExists) continue;

      const categoryId = (await suggestCategoryId(tx.description)) ?? fallbackCategoryId;

      await prisma.transaction.create({
        data: {
          amount: tx.amount,
          description: tx.description,
          date: new Date(tx.date),
          type: "variable",
          source: "bank",
          categoryId,
          bankAccountId,
        },
      });
      imported++;
    }

    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { status: "connected", lastSyncedAt: new Date(), lastError: null },
    });

    return { ok: true as const, imported };
  } catch (err) {
    const message = err instanceof BankAggregatorError ? err.message : "Error inesperado al sincronizar con el banco";
    await prisma.bankConnection.update({
      where: { id: connection.id },
      data: { status: "error", lastError: message },
    });
    return { ok: false as const, error: message };
  }
}

export function getSyncIntervalMs(): number {
  return env.BANK_SYNC_INTERVAL_HOURS * 60 * 60 * 1000;
}
