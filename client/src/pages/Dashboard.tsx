import { useState } from "react";
import { currentMonthKey, useDashboardSummary } from "../api/hooks";
import { formatCOP, formatDayOfMonth } from "../utils/format";
import { StatCard } from "../components/StatCard";
import { MonthNav } from "../components/MonthNav";

export function Dashboard() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading, isError } = useDashboardSummary(month);

  return (
    <div className="flex flex-col gap-6">
      <MonthNav month={month} onChange={setMonth} />

      {isLoading && <p className="text-slate-400">Cargando...</p>}
      {isError && <p className="text-red-400">No se pudo cargar el resumen del mes.</p>}

      {data && (
        <>
          <div>
            <p className="text-sm text-slate-400">Restante para gastar</p>
            <p className={`text-4xl font-bold ${data.remaining >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCOP(data.remaining)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Ingresos" value={formatCOP(data.totalIncome)} tone="positive" />
            <StatCard label="Gastos fijos" value={formatCOP(data.totalFixed)} />
            <StatCard label="Gastos variables" value={formatCOP(data.totalVariable)} />
            <StatCard label="Ahorro apartado" value={formatCOP(data.totalSavings)} />
          </div>

          <div className="rounded-xl bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-200">Deuda total</p>
              <p className="text-lg font-semibold text-red-400">{formatCOP(data.totalDebt)}</p>
            </div>
            {data.upcomingDebtPayments.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-400">
                {data.upcomingDebtPayments.map((d) => (
                  <li key={d.id} className="flex justify-between">
                    <span>
                      {d.name} ({d.institution})
                    </span>
                    <span>
                      {formatCOP(d.minPayment)} · {formatDayOfMonth(d.dueDay)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.variableByCategory.length > 0 ? (
            <div className="rounded-xl bg-slate-900 p-4">
              <p className="mb-3 text-sm font-medium text-slate-200">Gastos variables por categoría</p>
              <ul className="flex flex-col gap-2">
                {data.variableByCategory.map((c) => (
                  <li key={c.categoryId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span>{c.icon}</span> {c.categoryName}
                    </span>
                    <span className="text-slate-200">{formatCOP(c.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">Sin gastos variables registrados este mes.</p>
          )}
        </>
      )}
    </div>
  );
}
