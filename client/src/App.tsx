import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppLayout } from "./components/AppLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Incomes } from "./pages/Incomes";
import { FixedExpenses } from "./pages/FixedExpenses";
import { Savings } from "./pages/Savings";
import { Debts } from "./pages/Debts";
import { BankConnection } from "./pages/BankConnection";

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Cargando...</div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transacciones" element={<Transactions />} />
        <Route path="/ingresos" element={<Incomes />} />
        <Route path="/fijos" element={<FixedExpenses />} />
        <Route path="/ahorro" element={<Savings />} />
        <Route path="/deudas" element={<Debts />} />
        <Route path="/banco" element={<BankConnection />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
