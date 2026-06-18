import { Link } from "react-router-dom";
import { apiGet } from "../lib/api-client";
import { formatDate } from "../lib/formatters";
import { useAsyncData } from "../hooks/useAsyncData";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { EmptyState } from "../components/ui/EmptyState";
import { StatusBadge } from "../components/ui/StatusBadge";

const activityLabels = {
  PROJECT_CREATED: "Proyecto creado",
  PROJECT_UPDATED: "Proyecto actualizado",
  PROJECT_DELETED: "Proyecto eliminado",
  TASK_CREATED: "Tarea creada",
  TASK_UPDATED: "Tarea actualizada",
  TASK_MOVED: "Tarea movida",
  TASK_MOVED_TO_IN_PROGRESS: "Tarea movida a en curso",
  TASK_DELETED: "Tarea eliminada",
  SUBTASK_CREATED: "Subtarea creada",
  SUBTASK_UPDATED: "Subtarea actualizada",
  SUBTASK_DELETED: "Subtarea eliminada",
  TEMPLATE_APPLIED: "Plantilla aplicada",
  USER_LOGGED_IN: "Sesion iniciada",
  USER_REGISTERED: "Cuenta creada",
  USER_PROFILE_UPDATED: "Perfil actualizado",
  EMAIL_NOTIFICATION_SENT: "Correo de confirmacion enviado",
  EMAIL_NOTIFICATION_FAILED: "No se pudo enviar el correo",
};

const quickLinks = [
  {
    title: "Gestionar proyectos",
    description: "Administra tareas, etapas y detalles en un solo lugar.",
    to: "/app/projects",
  },
  {
    title: "Abrir lista",
    description: "Consulta todas las tareas del proyecto activo con mas detalle.",
    to: "/app/list",
  },
  {
    title: "Ver calendario",
    description: "Consulta tus fechas y entregas cercanas.",
    to: "/app/calendar",
  },
  {
    title: "Revisar progreso",
    description: "Observa tu avance y ritmo de trabajo.",
    to: "/app/analytics",
  },
  {
    title: "Aplicar plantilla",
    description: "Empieza mas rapido con una estructura lista.",
    to: "/app/templates",
  },
  {
    title: "Configurar perfil",
    description: "Gestiona materias, periodos y preferencias del entorno.",
    to: "/app/profile",
  },
];

export function DashboardPage() {
  const { data, loading, error, refetch } = useAsyncData(() => apiGet("/dashboard/overview"), []);

  if (loading) {
    return (
      <div className="grid gap-5">
        <SkeletonCard className="h-[300px]" />
        <div className="grid gap-5 xl:grid-cols-[1fr,0.95fr]">
          <SkeletonCard className="h-[360px]" />
          <SkeletonCard className="h-[360px]" />
        </div>
        <SkeletonCard className="h-[300px]" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <button className="btn-primary" onClick={() => refetch().catch(() => {})} type="button">
            Reintentar
          </button>
        }
        description={error.message}
        title="No se pudo cargar el panel"
      />
    );
  }

  const isEmptyWorkspace = data.metrics.totalProjects === 0 && data.metrics.totalTasks === 0;
  const metrics = [
    ["Proyectos activos", data.metrics.totalProjects],
    ["Tareas totales", data.metrics.totalTasks],
    ["Materias activas", data.metrics.totalSubjects],
    ["Completadas esta semana", data.metrics.completedThisWeek],
    ["Cumplimiento", `${data.metrics.completionRate}%`]
  ];

  if (isEmptyWorkspace) {
    return (
      <div className="space-y-4 overflow-x-hidden sm:space-y-6">
        <section className="panel overflow-hidden p-0">
          <div className="bg-primary-glow p-5 sm:p-6">
            <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr] xl:items-center">
              <div>
                <p className="section-kicker">Bienvenido</p>
                <h1 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
                  Tu espacio esta listo para empezar.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                  Aun no tienes proyectos ni tareas. Crea tu primer espacio de trabajo o usa una plantilla para comenzar
                  mas rapido.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="btn-primary" to="/app/projects">
                    Crear proyecto
                  </Link>
                  <Link className="btn-secondary" to="/app/templates">
                    Ver plantillas
                  </Link>
                  <Link className="btn-secondary" to="/app/profile">
                    Configurar perfil
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SpotlightCard label="Proyectos" value="0" tone="primary" helper="Sin espacios creados" />
                <SpotlightCard label="Tareas" value="0" tone="secondary" helper="Todavia no registras pendientes" />
                <SpotlightCard label="Calendario" value="0" tone="danger" helper="No hay entregas cargadas" />
                <SpotlightCard label="Progreso" value="0%" tone="success" helper="Tu avance aparecera aqui" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <ActionCard
            title="Crea tu primer proyecto"
            description="Organiza una materia, una tesis o cualquier plan en un tablero claro."
            to="/app/projects"
            label="Ir a proyectos"
          />
          <ActionCard
            title="Empieza con una plantilla"
            description="Usa una estructura base para examenes, proyectos grupales o presentaciones."
            to="/app/templates"
            label="Explorar plantillas"
          />
          <ActionCard
            title="Prepara tus fechas"
            description="Cuando agregues tareas con fecha, las veras ordenadas en el calendario."
            to="/app/calendar"
            label="Abrir calendario"
          />
          <ActionCard
            title="Activa tus materias"
            description="Crea el periodo, registra materias y conecta tu agenda academica."
            to="/app/profile"
            label="Ir al perfil"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-x-hidden sm:space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr] xl:gap-5">
        <article className="panel overflow-hidden p-0">
          <div className="bg-primary-glow p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-kicker">Foco semanal</p>
                <h2 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">Tu semana en un solo vistazo.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  Revisa lo que urge, detecta tareas importantes y manten una vista clara de tu carga.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-[430px]">
                <SpotlightCard label="Vencidas" value={data.metrics.overdueCount} tone="danger" helper="Revisalas cuanto antes" />
                <SpotlightCard label="Alta prioridad" value={data.metrics.highPriorityOpen} tone="primary" helper="Lo mas urgente ahora" />
                <SpotlightCard label="Para hoy" value={data.metrics.dueToday} tone="secondary" helper="Pendiente para hoy" />
                <SpotlightCard label="Cumplimiento" value={`${data.metrics.completionRate}%`} tone="success" helper="Tu ritmo actual" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:gap-4 sm:p-6 xl:grid-cols-5">
            {metrics.map(([label, value]) => (
              <article key={label} className="metric-card">
                <p className="text-sm text-muted">{label}</p>
                <strong className="mt-4 block text-4xl font-semibold text-text">{value}</strong>
              </article>
            ))}
          </div>
        </article>

        <article className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Foco inmediato</p>
              <h2 className="mt-3 text-2xl font-semibold text-text">Siguiente bloque de trabajo</h2>
            </div>
            <span className="pill">{data.focusTasks.length} tareas</span>
          </div>

          <div className="mt-6 space-y-3">
            {data.focusTasks.length ? (
              data.focusTasks.map((task) => (
                <div key={task.id} className="surface-tile">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.projectColor }} />
                        <p className="text-sm font-semibold text-text">{task.title}</p>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{task.projectTitle}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <StatusBadge value={task.priority} />
                      <StatusBadge value={task.status} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>{formatDate(task.dueDate, { withYear: true })}</span>
                    <span className="pill">
                      {task.completedSubtasks}/{task.totalSubtasks} subtareas
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyInline message="No hay tareas abiertas por priorizar ahora mismo." />
            )}
          </div>
        </article>
      </section>

      <section className="panel p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">Navegacion rapida</p>
            <h2 className="mt-3 text-2xl font-semibold text-text">Accesos directos</h2>
          </div>
          <span className="pill">Abre lo que necesitas</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              className="interactive-card group"
              to={item.to}
            >
              <p className="font-semibold text-text">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
              <span className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-primary transition group-hover:text-secondary">
                Abrir vista
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,0.95fr] xl:gap-5">
        <article className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Materias activas</p>
              <h2 className="mt-3 text-2xl font-semibold text-text">
                {data.activeTerm?.name ?? "Sin periodo activo"}
              </h2>
            </div>
            <span className="pill">{data.activeSubjects.length} materias</span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.activeSubjects.length ? (
              data.activeSubjects.map((subject) => (
                <article key={subject.id} className="surface-tile">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                    <div>
                      <p className="font-semibold text-text">{subject.name}</p>
                      <p className="mt-1 text-xs text-muted">{subject.code || "Sin codigo"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">{subject.instructor || "Sin docente asignado"}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-muted">
                    {subject.projectCount} proyecto{subject.projectCount === 1 ? "" : "s"} asociado{subject.projectCount === 1 ? "" : "s"}
                  </p>
                </article>
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyInline message="Todavia no has registrado materias. Ve al perfil para crear tu periodo academico." />
              </div>
            )}
          </div>
        </article>

        <article className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Agenda cercana</p>
              <h2 className="mt-3 text-2xl font-semibold text-text">Proximos eventos</h2>
            </div>
            <span className="pill">{data.metrics.scheduledEvents} eventos</span>
          </div>

          <div className="mt-6 space-y-3">
            {data.upcomingEvents.length ? (
              data.upcomingEvents.map((event) => (
                <div key={event.id} className="surface-tile">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                        <p className="font-semibold text-text">{event.title}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted">{event.subjectName ?? event.projectTitle ?? "Evento personal"}</p>
                    </div>
                    <span className="pill">{event.type}</span>
                  </div>
                  <p className="mt-4 text-xs text-muted">{formatDate(event.startAt, { withYear: true, withTime: true })}</p>
                </div>
              ))
            ) : (
              <EmptyInline message="Todavia no hay eventos registrados para los proximos dias." />
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr,0.95fr] xl:gap-5">
        <article className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Carga de los proximos 7 dias</p>
              <h2 className="mt-3 text-2xl font-semibold text-text">Ritmo semanal</h2>
            </div>
            <span className="pill">Ventana operativa</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
            {data.weeklyLoad.map((day) => (
              <div key={day.date} className="surface-tile">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{day.label}</p>
                <strong className="mt-3 block text-3xl font-semibold text-text">{day.count}</strong>
                <p className="mt-2 text-xs text-muted">
                  {day.highPriority ? `${day.highPriority} alta prioridad` : "Sin alertas criticas"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {data.statusBreakdown.map((item) => (
              <div key={item.status} className="surface-tile">
                <p className="text-sm text-muted">{item.label}</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <strong className="text-3xl font-semibold text-text">{item.count}</strong>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Entregas cercanas</p>
              <h2 className="mt-3 text-2xl font-semibold text-text">Ventana critica de trabajo</h2>
            </div>
            <span className="pill">{data.metrics.overdueCount} vencidas</span>
          </div>
          <div className="mt-6 space-y-3">
            {data.dueSoon.length ? (
              data.dueSoon.map((task) => (
                <div key={task.id} className="surface-tile">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text">{task.title}</p>
                      <p className="mt-2 text-sm text-muted">{task.project.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge value={task.status} />
                      <p className="mt-2 text-xs text-muted">{formatDate(task.dueDate, { withYear: true })}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyInline message="No hay fechas limite proximas registradas." />
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr] xl:gap-5">
        <article className="panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Resumen por proyecto</p>
              <h2 className="mt-3 text-2xl font-semibold text-text">Carga operativa actual</h2>
            </div>
            <span className="pill">Metricas por proyecto</span>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {data.projectSummaries.length ? (
              data.projectSummaries.map((project) => (
                <article key={project.id} className="app-card">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <h3 className="font-semibold text-text">{project.title}</h3>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-muted">
                    <div>
                      <p>Tareas</p>
                      <strong className="mt-2 block text-2xl text-text">{project.tasks}</strong>
                    </div>
                    <div>
                      <p>Completadas</p>
                      <strong className="mt-2 block text-2xl text-text">{project.completed}</strong>
                    </div>
                  </div>
                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-bg/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${project.tasks ? Math.round((project.completed / project.tasks) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="mt-5 text-xs text-muted">
                    {project.dueDate ? `Entrega del proyecto: ${formatDate(project.dueDate, { withYear: true })}` : "Sin fecha limite"}
                  </p>
                </article>
              ))
            ) : (
              <div className="xl:col-span-2">
                <EmptyInline message="Aun no hay proyectos creados." />
              </div>
            )}
          </div>
        </article>

        <article className="panel p-4 sm:p-6">
          <p className="section-kicker">Actividad reciente</p>
          <h2 className="mt-3 text-2xl font-semibold text-text">Ultimos movimientos</h2>
          <div className="mt-6 space-y-3">
            {data.activity.length ? (
              data.activity.map((item) => (
                <div key={item.id} className="surface-tile">
                  <p className="text-sm font-semibold text-text">{activityLabels[item.action] ?? "Actualizacion registrada"}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{item.entityType}</p>
                  <p className="mt-3 text-xs text-muted">{formatDate(item.createdAt, { withYear: true, withTime: true })}</p>
                </div>
              ))
            ) : (
              <EmptyInline message="Todavia no hay actividad registrada." />
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function EmptyInline({ message }) {
  return <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted">{message}</div>;
}

function ActionCard({ title, description, to, label }) {
  return (
    <Link
      className="interactive-card group"
      to={to}
    >
      <p className="font-semibold text-text">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      <span className="mt-5 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-primary transition group-hover:text-secondary">
        {label}
      </span>
    </Link>
  );
}

function SpotlightCard({ label, value, tone, helper }) {
  const toneClass = {
    danger: "spotlight-danger",
    primary: "spotlight-primary",
    secondary: "spotlight-secondary",
    success: "spotlight-success",
  };

  return (
    <div className={`spotlight-card min-w-0 ${toneClass[tone] ?? toneClass.primary}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.12em] [overflow-wrap:anywhere] sm:text-[11px] sm:tracking-[0.18em]">
          {label}
        </p>
        <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-80" />
      </div>
      <strong className="mt-4 block text-3xl font-semibold text-text sm:mt-5 sm:text-4xl">{value}</strong>
      <p className="mt-2 text-xs text-muted">{helper}</p>
    </div>
  );
}
