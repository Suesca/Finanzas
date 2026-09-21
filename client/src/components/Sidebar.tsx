import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./NavItems";
import { useAuth } from "../auth/AuthContext";

export function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-4 md:flex">
      <div className="mb-8 px-2 text-lg font-semibold text-white">💰 Finanzas</div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "bg-brand-600/20 text-brand-500" : "text-slate-300 hover:bg-slate-900"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => logout()}
        className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-900"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
