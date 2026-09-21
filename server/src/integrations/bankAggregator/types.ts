export interface AggregatorAccount {
  externalId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface AggregatorTransaction {
  externalId: string;
  accountExternalId: string;
  amount: number;
  description: string;
  date: string; // ISO date
}

export interface LinkedInstitution {
  institutionName: string;
  accounts: AggregatorAccount[];
}

/**
 * Contrato que debe cumplir cualquier proveedor de agregación bancaria
 * (Belvo, Finerio Connect, un futuro conector de Open Finance, etc.).
 * El resto de la app solo depende de esta interfaz, nunca de un proveedor
 * concreto, para poder cambiar de agregador sin tocar rutas ni servicios.
 */
export interface BankAggregatorProvider {
  readonly name: string;

  /** Simula/ejecuta el flujo de vinculación de una cuenta bancaria. */
  linkAccount(): Promise<LinkedInstitution>;

  /** Devuelve las cuentas asociadas a una conexión ya vinculada. */
  getAccounts(): Promise<AggregatorAccount[]>;

  /** Devuelve transacciones nuevas desde `since` (o todas si se omite). */
  getTransactions(since?: Date): Promise<AggregatorTransaction[]>;
}

export class BankAggregatorError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "BankAggregatorError";
  }
}
