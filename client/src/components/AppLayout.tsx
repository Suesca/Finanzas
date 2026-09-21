import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { QuickAddSheet } from "./QuickAddSheet";
import { SyncStatusBanner } from "./SyncStatusBanner";

export function AppLayout() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <SyncStatusBanner />
        <main className="mx-auto max-w-3xl min-w-0 px-4 pb-28 pt-6 md:pb-10">
          <Outlet />
        </main>
      </div>

      <button
        onClick={() => setShowQuickAdd(true)}
        aria-label="Registrar gasto"
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg shadow-brand-600/30 active:scale-95 md:bottom-8 md:right-8"
      >
        +
      </button>

      <BottomNav />

      {showQuickAdd && <QuickAddSheet onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}
