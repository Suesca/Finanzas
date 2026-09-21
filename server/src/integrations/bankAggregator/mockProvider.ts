import { AggregatorAccount, AggregatorTransaction, BankAggregatorProvider, LinkedInstitution } from "./types";

const MOCK_ACCOUNT: AggregatorAccount = {
  externalId: "mock-account-1",
  name: "Cuenta de ahorros",
  type: "savings_account",
  balance: 1850000,
  currency: "COP",
};

function randomRecentDate(daysAgoMax: number): string {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * daysAgoMax);
  return new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Proveedor de ejemplo: no llama a ninguna API real. Sirve para desarrollar
 * y probar todo el flujo de sincronización sin credenciales de un agregador.
 */
export class MockBankAggregatorProvider implements BankAggregatorProvider {
  readonly name = "mock";

  async linkAccount(): Promise<LinkedInstitution> {
    return { institutionName: "Davivienda (demo)", accounts: [MOCK_ACCOUNT] };
  }

  async getAccounts(): Promise<AggregatorAccount[]> {
    return [MOCK_ACCOUNT];
  }

  async getTransactions(_since?: Date): Promise<AggregatorTransaction[]> {
    const samples: Omit<AggregatorTransaction, "externalId" | "accountExternalId" | "date">[] = [
      { amount: 15000, description: "Compra Rappi" },
      { amount: 8000, description: "Transmilenio" },
      { amount: 45000, description: "Supermercado Exito" },
      { amount: 6000, description: "Juan Valdez Cafe" },
    ];

    return samples.map((s, index) => ({
      ...s,
      externalId: `mock-tx-${Date.now()}-${index}`,
      accountExternalId: MOCK_ACCOUNT.externalId,
      date: randomRecentDate(5),
    }));
  }
}
