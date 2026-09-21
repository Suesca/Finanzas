import { useBankConnections, useSyncBank } from "../api/hooks";
import { formatCOP } from "../utils/format";

const DATETIME_FORMAT = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export function BankConnection() {
  const { data, isLoading } = useBankConnections();
  const sync = useSyncBank();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Conexión bancaria</h1>
        <button
          onClick={() => sync.mutate()}
          disabled={sync.isPending}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {sync.isPending ? "Sincronizando..." : "Sincronizar ahora"}
        </button>
      </div>

      {sync.isSuccess && (
        <p className="text-sm text-emerald-400">Sincronizado: {sync.data.imported} transacciones nuevas.</p>
      )}
      {sync.isError && <p className="text-sm text-red-400">No se pudo sincronizar. Intenta de nuevo.</p>}

      {isLoading && <p className="text-slate-400">Cargando...</p>}

      {data?.map((connection) => (
        <div key={connection.id} className="rounded-xl bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-100">{connection.institutionName}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                connection.status === "error"
                  ? "bg-red-500/20 text-red-300"
                  : connection.status === "syncing"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {connection.status === "error" ? "Error" : connection.status === "syncing" ? "Sincronizando" : "Conectado"}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Última actualización:{" "}
            {connection.lastSyncedAt ? DATETIME_FORMAT.format(new Date(connection.lastSyncedAt)) : "nunca"}
          </p>

          {connection.lastError && <p className="mt-2 text-sm text-red-400">{connection.lastError}</p>}

          <ul className="mt-3 flex flex-col gap-2">
            {connection.accounts.map((acc) => (
              <li key={acc.id} className="flex justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
                <span className="text-slate-300">{acc.name}</span>
                <span className="text-slate-100">{formatCOP(acc.balance)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="text-xs text-slate-500">
        Proveedor: {import.meta.env.DEV ? "mock (datos de ejemplo, sin credenciales reales)" : "según BANK_PROVIDER"}.
        La sincronización es periódica (polling), no en tiempo real.
      </p>
    </div>
  );
}
