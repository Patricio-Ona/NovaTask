import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Inicio", to: "/app/dashboard", helper: "Resumen general" },
  { label: "Proyectos", to: "/app/projects", helper: "Tareas y tableros" },
  { label: "Lista", to: "/app/list", helper: "Revision detallada" },
  { label: "Calendario", to: "/app/calendar", helper: "Fechas importantes" },
  { label: "Progreso", to: "/app/analytics", helper: "Avance personal" },
  { label: "Plantillas", to: "/app/templates", helper: "Empieza mas rapido" },
  { label: "Perfil", to: "/app/profile", helper: "Cuenta y materias" },
];

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"} xl:static xl:z-auto xl:pointer-events-auto`}
    >
      <button
        className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition xl:hidden ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
      />

      <aside
        className={`panel relative z-10 flex h-full w-[88vw] max-w-[320px] flex-col overflow-hidden p-5 transition duration-300 xl:h-fit xl:w-auto xl:max-w-none xl:translate-x-0 xl:sticky xl:top-4 ${
          open ? "translate-x-0" : "-translate-x-[105%]"
        } ${collapsed ? "xl:hidden" : "xl:flex"} ${
          collapsed ? "xl:pointer-events-none" : ""
        }`}
      >
        <div className="pointer-events-none absolute -left-12 top-10 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-20 h-28 w-28 rounded-full bg-secondary/20 blur-3xl" />

        <div className="flex items-center justify-between gap-3 xl:block">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-semibold text-white">
              N
            </div>
            <div>
              <p className="font-semibold text-text">NovaTask</p>
              <p className="text-sm text-muted">Tu espacio de trabajo</p>
            </div>
          </div>

          <button className="btn-ghost px-3 py-2 xl:hidden" onClick={onClose} type="button">
            Cerrar
          </button>
        </div>

        <div className="mt-4 hidden xl:flex">
          <button className="btn-secondary w-full justify-center" onClick={onToggleCollapse} type="button">
            Ocultar menu
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-surface/70 p-4">
          <p className="section-kicker">Organiza mejor tu tiempo</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">Manten todo bajo control.</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Revisa lo pendiente, mueve tareas entre etapas y visualiza tus fechas importantes desde un solo lugar.
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
                <motion.div
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                    isActive
                      ? "border-primary/40 bg-primary/15 text-text shadow-soft"
                      : "border-border bg-surface/50 text-muted hover:border-primary/30 hover:text-text"
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <div>
                    <span className="block">{item.label}</span>
                    <span className="mt-1 block text-[11px] text-muted/80">{item.helper}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.18em]">{isActive ? "Activo" : "Abrir"}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-3xl border border-border bg-gradient-to-br from-surface/90 to-bg/80 p-4">
          <p className="section-kicker">Consejo rapido</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Divide una tarea grande en subtareas para ver avances pequenos y mantener mejor el ritmo de trabajo.
          </p>
        </div>
      </aside>
    </div>
  );
}
