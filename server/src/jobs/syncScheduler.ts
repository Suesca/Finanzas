import cron from "node-cron";
import { env } from "../env";
import { syncBankData } from "../services/sync.service";

/** Convierte horas a una expresión cron válida (mínimo cada hora). */
function intervalToCronExpression(hours: number): string {
  const safeHours = Math.max(1, Math.round(hours));
  return `0 */${safeHours} * * *`;
}

export function startSyncScheduler() {
  const expression = intervalToCronExpression(env.BANK_SYNC_INTERVAL_HOURS);

  cron.schedule(expression, async () => {
    console.log("[bank-sync] Ejecutando sincronización programada...");
    const result = await syncBankData();
    if (result.ok) {
      console.log(`[bank-sync] Listo. ${result.imported} transacciones nuevas.`);
    } else {
      console.error(`[bank-sync] Falló: ${result.error}`);
    }
  });

  console.log(`[bank-sync] Programado con expresión cron "${expression}" (cada ${env.BANK_SYNC_INTERVAL_HOURS}h).`);
}
