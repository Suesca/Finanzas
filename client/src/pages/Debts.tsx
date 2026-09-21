import { FormEvent, useState } from "react";
import { useCreateDebt, useDebts, useDeleteDebt, useUpdateDebt } from "../api/hooks";
import { formatCOP, formatDayOfMonth } from "../utils/format";
import { Debt } from "../types";

function EditDebtRow({ debt, onDone }: { debt: Debt; onDone: () => void }) {
  const updateDebt = useUpdateDebt();
  const [name, setName] = useState(debt.name);
  const [institution, setInstitution] = useState(debt.institution);
  const [totalAmount, setTotalAmount] = useState(String(debt.totalAmount));
  const [remainingAmount, setRemainingAmount] = useState(String(debt.remainingAmount));
  const [minPayment, setMinPayment] = useState(String(debt.minPayment));
  const [dueDay, setDueDay] = useState(String(debt.dueDay));

  async function handleSave() {
    if (!name || !institution || !totalAmount || !remainingAmount || !minPayment) return;
    await updateDebt.mutateAsync({
      id: debt.id,
      name,
      institution,
      totalAmount: Number(totalAmount),
      remainingAmount: Number(remainingAmount),
      minPayment: Number(minPayment),
      dueDay: Number(dueDay),
    });
    onDone();
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-slate-900 p-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
      />
      <input
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        className="rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
      />
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="Monto total"
          className="flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
        <input
          type="tel"
          inputMode="numeric"
          value={remainingAmount}
          onChange={(e) => setRemainingAmount(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="Saldo actual"
          className="flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={minPayment}
          onChange={(e) => setMinPayment(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="Pago mínimo"
          className="flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
        <input
          type="number"
          min={1}
          max={31}
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          className="w-20 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={updateDebt.isPending}
          className="flex-1 rounded-lg bg-brand-600 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button onClick={onDone} className="flex-1 rounded-lg bg-slate-800 py-1.5 text-sm text-slate-300">
          Cancelar
        </button>
      </div>
    </li>
  );
}

export function Debts() {
  const { data, isLoading } = useDebts();
  const createDebt = useCreateDebt();
  const deleteDebt = useDeleteDebt();
  const updateDebt = useUpdateDebt();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [dueDay, setDueDay] = useState("1");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !institution || !totalAmount || !remainingAmount || !minPayment) return;
    await createDebt.mutateAsync({
      name,
      institution,
      totalAmount: Number(totalAmount),
      remainingAmount: Number(remainingAmount),
      minPayment: Number(minPayment),
      dueDay: Number(dueDay),
    });
    setName("");
    setInstitution("");
    setTotalAmount("");
    setRemainingAmount("");
    setMinPayment("");
  }

  function registrarPago(debtId: string, remaining: number, minPayment: number) {
    const nuevoRestante = Math.max(0, remaining - minPayment);
    updateDebt.mutate({ id: debtId, remainingAmount: nuevoRestante });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Deudas</h1>

      <ul className="flex flex-col gap-2">
        {data?.map((d) =>
          editingId === d.id ? (
            <EditDebtRow key={d.id} debt={d} onDone={() => setEditingId(null)} />
          ) : (
            <li key={d.id} className="rounded-xl bg-slate-900 p-4">
              <div className="flex items-start justify-between">
                <button onClick={() => setEditingId(d.id)} className="text-left" aria-label="Editar">
                  <p className="text-sm text-slate-100">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.institution}</p>
                </button>
                <button onClick={() => deleteDebt.mutate(d.id)} className="text-slate-500 hover:text-red-400">
                  ✕
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-red-400">{formatCOP(d.remainingAmount)}</span>
                <span className="text-xs text-slate-500">
                  de {formatCOP(d.totalAmount)} · pago mínimo {formatCOP(d.minPayment)} · {formatDayOfMonth(d.dueDay)}
                </span>
              </div>
              {d.remainingAmount > 0 && (
                <button
                  onClick={() => registrarPago(d.id, d.remainingAmount, d.minPayment)}
                  className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-sm text-slate-200"
                >
                  Registrar pago mínimo
                </button>
              )}
            </li>
          )
        )}
      </ul>

      {isLoading && <p className="text-slate-400">Cargando...</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-900 p-4">
        <p className="text-sm font-medium text-slate-200">Agregar deuda</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (ej. Tarjeta de crédito)"
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
        />
        <input
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Entidad (ej. Davivienda)"
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
        />
        <div className="flex gap-3">
          <input
            type="tel"
            inputMode="numeric"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Monto total"
            className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
          />
          <input
            type="tel"
            inputMode="numeric"
            value={remainingAmount}
            onChange={(e) => setRemainingAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Saldo actual"
            className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="tel"
            inputMode="numeric"
            value={minPayment}
            onChange={(e) => setMinPayment(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Pago mínimo"
            className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
          />
          <input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-24 rounded-lg bg-slate-800 px-3 py-2 text-white outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={createDebt.isPending}
          className="rounded-lg bg-brand-600 py-2 font-medium text-white disabled:opacity-50"
        >
          Agregar deuda
        </button>
      </form>
    </div>
  );
}
