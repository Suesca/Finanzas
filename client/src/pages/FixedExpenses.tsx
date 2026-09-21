import { FormEvent, useState } from "react";
import {
  useCategories,
  useCreateFixedExpense,
  useDeleteFixedExpense,
  useFixedExpenses,
  useUpdateFixedExpense,
} from "../api/hooks";
import { formatCOP, formatDayOfMonth } from "../utils/format";
import { FixedExpense } from "../types";

function EditFixedExpenseRow({ expense, onDone }: { expense: FixedExpense; onDone: () => void }) {
  const { data: categories } = useCategories("fixed");
  const updateExpense = useUpdateFixedExpense();

  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(expense.amount));
  const [dueDay, setDueDay] = useState(String(expense.dueDay));
  const [categoryId, setCategoryId] = useState(expense.categoryId);
  const [active, setActive] = useState(expense.active);

  async function handleSave() {
    if (!description || !amount || !categoryId) return;
    await updateExpense.mutateAsync({
      id: expense.id,
      description,
      amount: Number(amount),
      dueDay: Number(dueDay),
      categoryId,
      active,
    });
    onDone();
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-slate-900 px-4 py-3">
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
      />
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          className="min-w-0 flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
        <input
          type="number"
          min={1}
          max={31}
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          className="w-16 shrink-0 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
      </div>
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
      >
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon} {c.name}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Activo (cuenta en el restante del mes)
      </label>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={updateExpense.isPending}
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

export function FixedExpenses() {
  const { data, isLoading } = useFixedExpenses();
  const { data: categories } = useCategories("fixed");
  const createExpense = useCreateFixedExpense();
  const deleteExpense = useDeleteFixedExpense();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [categoryId, setCategoryId] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description || !amount || !categoryId) return;
    await createExpense.mutateAsync({ description, amount: Number(amount), dueDay: Number(dueDay), categoryId });
    setDescription("");
    setAmount("");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Gastos fijos</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-slate-900 p-4">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (ej. Arriendo)"
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
        />
        <div className="flex gap-3">
          <input
            type="tel"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Monto"
            className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2 text-white outline-none placeholder:text-slate-500"
          />
          <input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-20 shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-white outline-none"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg bg-slate-800 px-3 py-2 text-white outline-none"
        >
          <option value="">Selecciona categoría</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={createExpense.isPending}
          className="rounded-lg bg-brand-600 py-2 font-medium text-white disabled:opacity-50"
        >
          Agregar gasto fijo
        </button>
      </form>

      {isLoading && <p className="text-slate-400">Cargando...</p>}

      <ul className="flex flex-col gap-2">
        {data?.map((f) =>
          editingId === f.id ? (
            <EditFixedExpenseRow key={f.id} expense={f} onDone={() => setEditingId(null)} />
          ) : (
            <li key={f.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-900 px-4 py-3">
              <button onClick={() => setEditingId(f.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-label="Editar">
                <span className="text-xl">{f.category.icon}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-100">
                    {f.description}
                    {!f.active && <span className="ml-2 text-xs text-slate-500">(inactivo)</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500">Se cobra el {formatDayOfMonth(f.dueDay)}</p>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-medium text-slate-100">{formatCOP(f.amount)}</span>
                <button onClick={() => deleteExpense.mutate(f.id)} className="text-slate-500 hover:text-red-400">
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
