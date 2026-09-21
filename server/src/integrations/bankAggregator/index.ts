import { env } from "../../env";
import { BankAggregatorProvider } from "./types";
import { MockBankAggregatorProvider } from "./mockProvider";
import { BelvoBankAggregatorProvider } from "./belvoProvider";

let cachedProvider: BankAggregatorProvider | null = null;

/** Factory: elige la implementación según BANK_PROVIDER (mock por defecto). */
export function getBankProvider(): BankAggregatorProvider {
  if (cachedProvider) return cachedProvider;

  cachedProvider = env.BANK_PROVIDER === "belvo" ? new BelvoBankAggregatorProvider() : new MockBankAggregatorProvider();

  return cachedProvider;
}

export * from "./types";
