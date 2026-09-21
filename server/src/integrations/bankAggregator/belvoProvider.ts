import { env } from "../../env";
import { AggregatorAccount, AggregatorTransaction, BankAggregatorError, BankAggregatorProvider, LinkedInstitution } from "./types";

const BASE_URL = env.BELVO_ENV === "production" ? "https://api.belvo.com" : "https://sandbox.belvo.com";

/**
 * Implementación real contra la API de Belvo (https://developers.belvo.com).
 *
 * Nota de integración: Belvo vincula una cuenta bancaria a través de su
 * "Connect Widget" (un flujo de UI que corre en el frontend y devuelve un
 * `link_id`). Ese widget no está incluido en este MVP — por eso
 * `linkAccount()` lanza un error explicativo en vez de fallar en silencio.
 * Una vez tengas un `link_id` real (guardado, por ejemplo, en
 * `BankConnection` o en una variable de entorno `BELVO_LINK_ID`),
 * `getAccounts` y `getTransactions` ya quedan listos para usarlo.
 */
export class BelvoBankAggregatorProvider implements BankAggregatorProvider {
  readonly name = "belvo";

  private get credentials(): string {
    if (!env.BELVO_SECRET_ID || !env.BELVO_SECRET_PASSWORD) {
      throw new BankAggregatorError(
        "Faltan BELVO_SECRET_ID / BELVO_SECRET_PASSWORD. Configúralas en el archivo .env."
      );
    }
    return Buffer.from(`${env.BELVO_SECRET_ID}:${env.BELVO_SECRET_PASSWORD}`).toString("base64");
  }

  private get linkId(): string {
    const linkId = process.env.BELVO_LINK_ID;
    if (!linkId) {
      throw new BankAggregatorError(
        "Falta BELVO_LINK_ID. Vincula una cuenta con el Connect Widget de Belvo y guarda el link_id resultante."
      );
    }
    return linkId;
  }

  private async request<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Basic ${this.credentials}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new BankAggregatorError(`Belvo respondió ${response.status}: ${text || response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof BankAggregatorError) throw err;
      throw new BankAggregatorError("No se pudo contactar a Belvo", err);
    }
  }

  async linkAccount(): Promise<LinkedInstitution> {
    throw new BankAggregatorError(
      "linkAccount() requiere el Connect Widget de Belvo en el frontend. Ver comentario en belvoProvider.ts."
    );
  }

  async getAccounts(): Promise<AggregatorAccount[]> {
    const data = await this.request<any[]>(`/api/accounts/?link=${this.linkId}`);
    return data.map((a) => ({
      externalId: a.id,
      name: a.name ?? a.category ?? "Cuenta",
      type: a.category ?? "unknown",
      balance: Math.round(Number(a.balance?.current ?? 0)),
      currency: a.currency ?? "COP",
    }));
  }

  async getTransactions(since?: Date): Promise<AggregatorTransaction[]> {
    const data = await this.request<any[]>(`/api/transactions/?link=${this.linkId}`, {
      link: this.linkId,
      date_from: since ? since.toISOString().slice(0, 10) : undefined,
    });
    return data.map((t) => ({
      externalId: t.id,
      accountExternalId: t.account?.id ?? t.account,
      amount: Math.round(Number(t.amount ?? 0)),
      description: t.description ?? t.merchant?.name ?? "Transacción",
      date: t.value_date ?? t.accounting_date ?? new Date().toISOString(),
    }));
  }
}
