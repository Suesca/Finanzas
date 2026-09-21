import { FormEvent, useState } from "react";
import { useCreateSavingsRule, useSavingsRules, useUpdateSavingsRule } from "../api/hooks";
import { formatCOP } from "../utils/format";

export function Savings() {
  const { data, isLoading } = useSavingsRules();
  const createRule = useCreateSavingsRule();
  const updateRule = useUpdateSavingsRule();

  const [mode, setMode] = useState<"fixed" | "percentage">("percentage");
  const [value, setValue] = useState("10");

  const activeRule = data?.find((r) => r.active);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value) return;
    await createRule.mutateAsync({ mode, value: Number(value), active: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Ahorro</h1>

      {activeRule && (
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Regla activa</p>
          <p className="text-lg font-semibold text-emerald-400">
            {activeRule.mode === "fixed" ? formatCOP(activeRule.value) : `${activeRule.value}% de los ingresos`}
          </p>
          <p className="mt-1 text-xs text-slate-500">Se aparta automáticamente cada mes antes de calcular el restante.</p>
          <button
            onClick={() => updateRule.mutate({ id: activeRule.id, active: false })}
            disabled={updateRule.isPending}
            className="mt-3 text-sm text-slate-400 underline decoration-dotted disabled:opacity-50"
          >
            Desactivar ahorro
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-900 p-4">
        <p className="text-sm font-medium text-slate-200">
          {activeRule ? "Cambiar regla de ahorro" : "Definir regla de ahorro"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("percentage")}
            className={`flex-1 rounded-lg py-2 text-sm ${mode === "percentage" ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            % de ingresos
          </button>
          <button
            type="button"
            onClick={() => setMode("fixed")}
            className={`flex-1 rounded-lg py-2 text-sm ${mode === "fixed" ? "bg-brand-600 text-white" : "bg-slate-800 text-slate-300"}`}
          >
            Monto fijo
          </button>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
          placeholder={mode === "percentage" ? "Porcentaje (ej. 10)" : "Monto (ej. 200000)"}
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={createRule.isPending}
          className="rounded-lg bg-brand-600 py-2 font-medium text-white disabled:opacity-50"
        >
          Guardar regla
        </button>
      </form>

      {isLoading && <p className="text-slate-400">Cargando...</p>}
    </div>
  );
}
