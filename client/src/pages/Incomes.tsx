import { FormEvent, useState } from "react";
import { useCreateIncome, useDeleteIncome, useIncomes, useUpdateIncome } from "../api/hooks";
import { formatCOP } from "../utils/format";
import { Income } from "../types";

function EditIncomeRow({ income, onDone }: { income: Income; onDone: () => void }) {
  const updateIncome = useUpdateIncome();
  const [description, setDescription] = useState(income.description);
  const [amount, setAmount] = useState(String(income.amount));
  const [recurring, setRecurring] = useState(income.recurring);

  async function handleSave() {
    if (!description || !amount) return;
    await updateIncome.mutateAsync({ id: income.id, description, amount: Number(amount), recurring });
    onDone();
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-slate-900 px-4 py-3">
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
      />
      <input
        type="tel"
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
        className="rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
      />
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        Se repite cada mes
      </label>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={updateIncome.isPending}
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

export function Incomes() {
  const { data, isLoading } = useIncomes();
  const createIncome = useCreateIncome();
  const deleteIncome = useDeleteIncome();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description || !amount) return;
    await createIncome.mutateAsync({ description, amount: Number(amount), recurring });
    setDescription("");
    setAmount("");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Ingresos</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-900 p-4">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (ej. Salario)"
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
        />
        <input
          type="tel"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="Monto"
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          Se repite cada mes
        </label>
        <button
          type="submit"
          disabled={createIncome.isPending}
          className="rounded-lg bg-brand-600 py-2 font-medium text-white disabled:opacity-50"
        >
          Agregar ingreso
        </button>
      </form>

      {isLoading && <p className="text-slate-400">Cargando...</p>}

      <ul className="flex flex-col gap-2">
        {data?.map((i) =>
          editingId === i.id ? (
            <EditIncomeRow key={i.id} income={i} onDone={() => setEditingId(null)} />
          ) : (
            <li key={i.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-900 px-4 py-3">
              <button onClick={() => setEditingId(i.id)} className="min-w-0 flex-1 text-left" aria-label="Editar">
                <p className="truncate text-sm text-slate-100">{i.description}</p>
                <p className="text-xs text-slate-500">{i.recurring ? "Mensual" : "Único"}</p>
              </button>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium text-emerald-400">{formatCOP(i.amount)}</span>
                <button onClick={() => deleteIncome.mutate(i.id)} className="text-slate-500 hover:text-red-400">
                  ✕
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
