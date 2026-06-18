import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiGet } from "../lib/api-client";
import { getChartSeriesLabel } from "../lib/display-labels";
import { formatDate } from "../lib/formatters";
import { EmptyState } from "../components/ui/EmptyState";
import { PageShell } from "../components/ui/PageShell";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAppStore } from "../store/useAppStore";

const chartColors = ["#6366F1", "#8B5CF6", "#22C55E", "#F59E0B"];

export function AnalyticsPage() {
  const theme = useAppStore((state) => state.theme);
  const { data, loading, error, refetch } = useAsyncData(() => apiGet("/analytics/overview"), []);

  if (loading) {
    return (
      <div className="grid gap-5">
        <SkeletonCard className="h-28" />
        <div className="grid gap-5 xl:grid-cols-2">
          <SkeletonCard className="h-[360px]" />
          <SkeletonCard className="h-[360px]" />
        </div>
        <SkeletonCard className="h-[340px]" />
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
        title="No se pudieron cargar las analiticas"
      />
    );
  }

  const pieData = [
    { name: "Completadas", porcentaje: data.summary.completionRate },
    { name: "Pendientes", porcentaje: 100 - data.summary.completionRate },
  ];
  const projectChartData = data.byProject.map((project) => ({
    ...project,
    tasks: project.value,
  }));
  const axisColor = theme === "light" ? "#64748B" : "#94A3B8";
  const gridColor = theme === "light" ? "#D8E1F0" : "#334155";
  const tooltipStyle = {
    backgroundColor: theme === "light" ? "rgba(255,255,255,0.96)" : "#0F172A",
    border: `1px solid ${theme === "light" ? "#D8E1F0" : "#334155"}`,
    borderRadius: 16,
    color: theme === "light" ? "#0F172A" : "#F8FAFC",
  };
  const tooltipFormatter = (value, name) => [value, getChartSeriesLabel(name)];
  const percentTooltipFormatter = (value, name) => [`${value}%`, getChartSeriesLabel(name)];

  return (
    <PageShell
      actions={<span className="pill">Tu progreso</span>}
      description="Sigue tu avance, identifica pendientes y revisa como se distribuye tu trabajo."
      kicker="Seguimiento"
      title="Analiticas personales"
    >
      <section className="grid gap-5 xl:grid-cols-5">
        <Metric title="Total de tareas" value={data.summary.totalTasks} />
        <Metric title="Cumplimiento" value={`${data.summary.completionRate}%`} />
        <Metric title="Vencidas" value={data.summary.overdue} />
        <Metric title="En curso" value={data.summary.inProgress} />
        <Metric title="En revision" value={data.summary.review} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="panel p-6">
          <p className="section-kicker">Tareas por proyecto</p>
          <h3 className="mt-3 text-2xl font-semibold text-text">Carga distribuida</h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectChartData}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(99,102,241,0.12)" }}
                  formatter={tooltipFormatter}
                />
                <Bar dataKey="tasks" name="tasks" fill="#6366F1" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel p-6">
          <p className="section-kicker">Cumplimiento global</p>
          <h3 className="mt-3 text-2xl font-semibold text-text">Tareas completadas y pendientes</h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="porcentaje" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={percentTooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr,0.9fr]">
        <article className="panel p-6">
          <p className="section-kicker">Tendencia semanal</p>
          <h3 className="mt-3 text-2xl font-semibold text-text">Tareas creadas y completadas</h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weeklyProgress}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip contentStyle={tooltipStyle} formatter={tooltipFormatter} />
                <Line dataKey="created" name="created" stroke="#8B5CF6" strokeWidth={3} type="monotone" />
                <Line dataKey="completed" name="completed" stroke="#22C55E" strokeWidth={3} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel p-6">
          <p className="section-kicker">Radar operativo</p>
          <h3 className="mt-3 text-2xl font-semibold text-text">Estado y prioridad del trabajo pendiente</h3>
          <div className="mt-6 grid gap-4">
            <div className="surface-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Estado</p>
              <div className="mt-4 space-y-3">
                {data.statusBreakdown.map((item) => (
                  <ProgressRow key={item.status} label={item.status} value={item.count} max={data.summary.totalTasks || 1} />
                ))}
              </div>
            </div>
            <div className="surface-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Prioridad</p>
              <div className="mt-4 space-y-3">
                {data.priorityBreakdown.map((item) => (
                  <ProgressRow
                    key={item.priority}
                    label={item.priority}
                    value={item.count}
                    max={data.summary.totalTasks || 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr,0.95fr]">
        <article className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Ejecucion por proyecto</p>
              <h3 className="mt-3 text-2xl font-semibold text-text">Comparativo de avance</h3>
            </div>
            <span className="pill">{data.completionByProject.length} proyectos</span>
          </div>
          <div className="mt-6 space-y-4">
            {data.completionByProject.length ? (
              data.completionByProject.map((project) => (
                <div key={project.id} className="app-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <p className="font-semibold text-text">{project.title}</p>
                    </div>
                    <span className="pill">{project.completionRate}% completado</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-bg/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${project.completionRate}%` }}
                    />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-3">
                    <div>
                      <p>Total tareas</p>
                      <strong className="mt-2 block text-2xl text-text">{project.total}</strong>
                    </div>
                    <div>
                      <p>Completadas</p>
                      <strong className="mt-2 block text-2xl text-text">{project.completed}</strong>
                    </div>
                    <div>
                      <p>Vencidas</p>
                      <strong className="mt-2 block text-2xl text-text">{project.overdue}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyInline message="Todavia no hay suficiente actividad para comparar proyectos." />
            )}
          </div>
        </article>

        <article className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Fechas limite cercanas</p>
              <h3 className="mt-3 text-2xl font-semibold text-text">Siguientes entregables</h3>
            </div>
            <span className="pill">Priorizar ahora</span>
          </div>
          <div className="mt-6 space-y-3">
            {data.upcomingDeadlines.length ? (
              data.upcomingDeadlines.map((task) => (
                <div key={task.id} className="surface-tile">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: task.projectColor }} />
                        <p className="font-semibold text-text">{task.title}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted">{task.projectTitle}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <StatusBadge value={task.priority} />
                      <StatusBadge value={task.status} />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted">{formatDate(task.dueDate, { withYear: true, withTime: true })}</p>
                </div>
              ))
            ) : (
              <EmptyInline message="No hay fechas limite pendientes por mostrar." />
            )}
          </div>
        </article>
      </section>
    </PageShell>
  );
}

function Metric({ title, value }) {
  return (
    <article className="metric-card">
      <p className="text-sm text-muted">{title}</p>
      <strong className="mt-4 block text-3xl font-semibold text-text">{value}</strong>
    </article>
  );
}

function ProgressRow({ label, value, max }) {
  const percent = max ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <StatusBadge value={label} />
        <span className="text-sm text-muted">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg/70">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EmptyInline({ message }) {
  return <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted">{message}</div>;
}
