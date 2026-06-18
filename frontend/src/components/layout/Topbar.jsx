import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { requestBrowserNotificationPermission } from "../../lib/notifications";

const pageTitles = {
  "/app/dashboard": "Inicio",
  "/app/projects": "Proyectos",
  "/app/list": "Lista de tareas",
  "/app/calendar": "Calendario",
  "/app/analytics": "Progreso",
  "/app/templates": "Plantillas",
  "/app/profile": "Perfil",
};

const pageDescriptions = {
  "/app/dashboard": "Revisa tus prioridades del dia y ordena tu jornada.",
  "/app/projects": "Organiza tareas, etapas y avances en un solo lugar.",
  "/app/list": "Consulta tareas en detalle, filtra mejor y entra rapido a cada entregable.",
  "/app/calendar": "Consulta fechas, entregas y bloques de trabajo.",
  "/app/analytics": "Observa tu ritmo y el avance de tus tareas.",
  "/app/templates": "Inicia mas rapido con estructuras ya preparadas.",
  "/app/profile": "Gestiona tu cuenta, materias, eventos y preferencias visuales.",
};

const weekDays = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const cleanText = (value, fallback = "") =>
  String(value ?? fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim() || fallback;

const getTodayLabel = () => {
  const today = new Date();
  return `${weekDays[today.getDay()]} ${String(today.getDate()).padStart(2, "0")} ${monthNames[today.getMonth()]}`;
};

export function Topbar({ onOpenSidebar, onToggleSidebarCollapse, sidebarCollapsed }) {
  const location = useLocation();
  const { user, logout, updateProfile } = useAuth();
  const { pushToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: cleanText(user?.name, ""),
    avatarUrl: user?.avatarUrl ?? "",
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    setProfileForm({
      name: cleanText(user?.name, ""),
      avatarUrl: user?.avatarUrl ?? "",
    });
  }, [user]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const displayName = useMemo(() => cleanText(user?.name, "Usuario"), [user?.name]);
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .slice(0, 2)
        .map((chunk) => chunk[0] ?? "")
        .join("")
        .toUpperCase() || "NT",
    [displayName]
  );

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await updateProfile({
        name: cleanText(profileForm.name),
        avatarUrl: profileForm.avatarUrl.trim() || "",
      });
      pushToast({
        title: "Perfil actualizado",
        description: "Tus datos se guardaron correctamente.",
        tone: "success",
      });
      setProfileModalOpen(false);
    } catch (error) {
      pushToast({
        title: "No se pudo guardar",
        description: error.message,
        tone: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const activateNotifications = async () => {
    const permission = await requestBrowserNotificationPermission();

    if (permission === "granted") {
      pushToast({
        title: "Notificaciones activadas",
        description: "Te avisaremos cuando completes una tarea.",
        tone: "success",
      });
      return;
    }

    pushToast({
      title: "Permiso no concedido",
      description: "El navegador las bloqueo. Los avisos por correo se pueden seguir usando.",
      tone: "info",
    });
  };

  return (
    <>
      <header className="panel relative z-30 isolate overflow-visible px-3 py-3 sm:px-5 sm:py-4">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <button className="btn-secondary px-3 py-2 xl:hidden" onClick={onOpenSidebar} type="button">
              Menu
            </button>
            <button className="btn-secondary hidden px-3 py-2 xl:inline-flex" onClick={onToggleSidebarCollapse} type="button">
              {sidebarCollapsed ? "Abrir menu" : "Ocultar menu"}
            </button>

            <div className="min-w-0">
              <p className="section-kicker">{getTodayLabel()}</p>
              <h2 className="mt-2 text-xl font-semibold text-text sm:text-3xl">
                {pageTitles[location.pathname] ?? "NovaTask"}
              </h2>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-muted sm:block">
                {pageDescriptions[location.pathname] ?? "Sigue avanzando a tu ritmo."}
              </p>
            </div>
          </div>

          <div className="relative z-40 w-full sm:max-w-[320px] lg:w-auto lg:max-w-none" ref={dropdownRef}>
            <button
              className="group flex w-full items-center justify-between gap-2 rounded-[24px] border border-primary/20 bg-surface/80 px-2.5 py-2 text-left shadow-soft transition hover:border-primary/40 hover:bg-surface sm:gap-3 sm:px-3 sm:py-2.5 lg:min-w-[290px] lg:justify-start"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              {user?.avatarUrl ? (
                <img
                  alt={displayName}
                  className="h-10 w-10 rounded-2xl object-cover ring-1 ring-white/10 sm:h-12 sm:w-12"
                  src={user.avatarUrl}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-white shadow-soft sm:h-12 sm:w-12">
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">{displayName}</p>
                <p className="hidden truncate text-xs text-muted sm:block">{user?.email}</p>
              </div>

              <div className="hidden rounded-full border border-border bg-bg/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted md:block">
                Cuenta
              </div>
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+12px)] z-[80] w-full rounded-[28px] border border-border bg-surface/95 p-3 shadow-soft backdrop-blur sm:w-[320px]">
                <div className="rounded-3xl border border-border bg-gradient-to-br from-surface/95 to-bg/90 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{displayName}</p>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <button
                    className="btn-ghost w-full justify-start rounded-2xl px-3 py-3"
                    onClick={() => {
                      setMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    type="button"
                  >
                    Editar perfil
                  </button>
                  <button
                    className="btn-ghost w-full justify-start rounded-2xl px-3 py-3"
                    onClick={() => {
                      setMenuOpen(false);
                      activateNotifications().catch(() => {});
                    }}
                    type="button"
                  >
                    Notificaciones del navegador
                  </button>
                  <button
                    className="btn-ghost w-full justify-start rounded-2xl px-3 py-3 text-danger hover:bg-danger/10 hover:text-danger"
                    onClick={logout}
                    type="button"
                  >
                    Cerrar sesion
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <Modal
        description="Actualiza tu nombre o tu imagen de perfil."
        onClose={() => setProfileModalOpen(false)}
        open={profileModalOpen}
        title="Editar perfil"
      >
        <form className="space-y-4" onSubmit={handleProfileSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Nombre</span>
            <input
              className="input"
              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
              value={profileForm.name}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-text">URL de imagen</span>
            <input
              className="input"
              onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
              placeholder="https://..."
              value={profileForm.avatarUrl}
            />
          </label>

          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setProfileModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="btn-primary" disabled={savingProfile || cleanText(profileForm.name).length < 3} type="submit">
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
