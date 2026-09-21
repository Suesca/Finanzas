import { useEffect, useRef, useState } from "react";
import { useCategories, useCreateTransaction, useQuickTemplates } from "../api/hooks";
import { formatCOP } from "../utils/format";

export function QuickAddSheet({ onClose }: { onClose: () => void }) {
  const { data: templates } = useQuickTemplates();
  const { data: categories } = useCategories("variable");
  const createTransaction = useCreateTransaction();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const numericAmount = Number(amount || 0);

  async function save(categoryId: string, overrideAmount?: number) {
    const finalAmount = overrideAmount ?? numericAmount;
    if (!finalAmount || finalAmount <= 0) {
      amountRef.current?.focus();
      return;
    }
    await createTransaction.mutateAsync({ amount: finalAmount, description: note, categoryId });
    setJustSaved(true);
    setTimeout(onClose, 450);
  }

  function handleTemplateTap(templateCategoryId: string, defaultAmount: number | null) {
    if (!numericAmount && defaultAmount) {
      save(templateCategoryId, defaultAmount);
    } else if (numericAmount) {
      save(templateCategoryId);
    } else {
      // Sin monto todavía: no hacemos nada, el usuario debe escribir un monto primero.
      amountRef.current?.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-slate-900 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Registrar gasto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Cerrar">
            ✕
          </button>
        </div>

        {justSaved ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-slate-200">Gasto guardado</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <input
                ref={amountRef}
                type="tel"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                className="w-full rounded-xl bg-slate-800 px-4 py-4 text-center text-3xl font-semibold tracking-wide text-white outline-none"
              />
              <p className="mt-1 text-center text-sm text-slate-500">
                {numericAmount > 0 ? formatCOP(numericAmount) : "Escribe el monto"}
              </p>
            </div>

            {templates && templates.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Frecuentes</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateTap(t.categoryId, t.defaultAmount)}
                      disabled={createTransaction.isPending}
                      className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-100 active:scale-95"
                    >
                      <span>{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Categoría</p>
              <div className="grid grid-cols-4 gap-2">
                {categories?.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleTemplateTap(c.id, null)}
                    disabled={createTransaction.isPending}
                    className="flex flex-col items-center gap-1 rounded-xl bg-slate-800 py-3 text-[11px] text-slate-200 active:scale-95"
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="line-clamp-1">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)"
              className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />

            {createTransaction.isError && (
              <p className="mt-2 text-sm text-red-400">No se pudo guardar. Intenta de nuevo.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
