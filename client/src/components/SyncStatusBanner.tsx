import { useBankConnections } from "../api/hooks";

export function SyncStatusBanner() {
  const { data: connections } = useBankConnections();
  const withError = connections?.find((c) => c.status === "error");

  if (!withError) return null;

  return (
    <div className="mx-4 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      ⚠️ Error sincronizando con {withError.institutionName}: {withError.lastError ?? "error desconocido"}
    </div>
  );
}
