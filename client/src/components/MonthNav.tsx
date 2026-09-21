import { currentMonthKey } from "../api/hooks";
import { monthLabel, shiftMonth } from "../utils/month";

export function MonthNav({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  const isCurrentMonth = month === currentMonthKey();

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        aria-label="Mes anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 active:scale-95"
      >
        ←
      </button>

      <div className="flex flex-col items-center">
        <p className="text-sm capitalize text-slate-200">{monthLabel(month)}</p>
        {!isCurrentMonth && (
          <button onClick={() => onChange(currentMonthKey())} className="text-xs text-brand-500 underline">
            Volver al mes actual
          </button>
        )}
      </div>

      <button
        onClick={() => onChange(shiftMonth(month, 1))}
        aria-label="Mes siguiente"
        disabled={isCurrentMonth}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-300 active:scale-95 disabled:opacity-30"
      >
        →
      </button>
    </div>
  );
}
