import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiClientError } from "../api/client";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(pin);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs rounded-2xl bg-slate-900 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">💰</div>
          <h1 className="text-xl font-semibold text-white">Finanzas</h1>
          <p className="text-sm text-slate-400">Ingresa tu PIN</p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mb-4 w-full rounded-xl bg-slate-800 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none"
          placeholder="••••"
        />

        {error && <p className="mb-4 text-center text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !pin}
          className="w-full rounded-xl bg-brand-600 py-3 font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
