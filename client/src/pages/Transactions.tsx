import { useState } from "react";
import { currentMonthKey, useCategories, useDeleteTransaction, useTransactions, useUpdateTransaction } from "../api/hooks";
import { formatCOP } from "../utils/format";
import { Transaction } from "../types";
import { MonthNav } from "../components/MonthNav";

const DATE_FORMAT = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function EditTransactionRow({ transaction, onDone }: { transaction: Transaction; onDone: () => void }) {
  const { data: categories } = useCategories("variable");
  const updateTransaction = useUpdateTransaction();

  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);

  async function handleSave() {
    if (!amount) return;
    await updateTransaction.mutateAsync({ id: transaction.id, amount: Number(amount), description, categoryId });
    onDone();
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-slate-900 px-4 py-3">
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
          className="w-28 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nota"
          className="flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-white outline-none placeholder:text-slate-500"
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
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={updateTransaction.isPending}
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

export function Transactions() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading } = useTransactions(month);
  const deleteTransaction = useDeleteTransaction();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">Gastos</h1>

      <MonthNav month={month} onChange={setMonth} />

      {isLoading && <p className="text-slate-400">Cargando...</p>}

      {data && data.length === 0 && <p className="text-slate-400">No hay gastos registrados este mes.</p>}

      <ul className="flex flex-col gap-2">
        {data?.map((t) =>
          editingId === t.id ? (
            <EditTransactionRow key={t.id} transaction={t} onDone={() => setEditingId(null)} />
          ) : (
            <li key={t.id} className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3">
              <button
                onClick={() => setEditingId(t.id)}
                className="flex flex-1 items-center gap-3 text-left"
                aria-label="Editar"
              >
                <span className="text-xl">{t.category.icon}</span>
                <div>
                  <p className="text-sm text-slate-100">{t.description || t.category.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.category.name} · {DATE_FORMAT.format(new Date(t.date))}
                    {t.source === "bank" ? " · banco" : ""}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-100">{formatCOP(t.amount)}</span>
                <button
                  onClick={() => deleteTransaction.mutate(t.id)}
                  aria-label="Eliminar"
                  className="text-slate-500 hover:text-red-400"
                >
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
