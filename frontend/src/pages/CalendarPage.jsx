import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api-client";
import { getEventTypeLabel } from "../lib/display-labels";
import { formatDate } from "../lib/formatters";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import { PageShell } from "../components/ui/PageShell";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs";

const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const getWeekStart = (date) => {
  const copy = startOfDay(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const startOfMonthGrid = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const day = firstDay.getDay();
  const offset = day === 0 ? 6 : day - 1;
  firstDay.setDate(firstDay.getDate() - offset);
  firstDay.setHours(0, 0, 0, 0);
  return firstDay;
};

const endOfMonthGrid = (date) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const day = lastDay.getDay();
  const offset = day === 0 ? 0 : 7 - day;
  lastDay.setDate(lastDay.getDate() + offset);
  lastDay.setHours(0, 0, 0, 0);
  return lastDay;
};

const itemDate = (item) => new Date(item.startAt ?? item.dueDate);
const defaultActivityColor = "#6366F1";
const clampTwoLinesStyle = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

const withAlpha = (color, alpha) => {
  if (!color?.startsWith("#")) return color;

  if (color.length === 4) {
    const [_, red, green, blue] = color;
    return `#${red}${red}${green}${green}${blue}${blue}${alpha}`;
  }

  if (color.length === 7) {
    return `${color}${alpha}`;
  }

  return color;
};

const getActivityMeta = (items, theme) => {
  const tasks = items.filter((item) => item.itemType === "TASK").length;
  const events = items.length - tasks;
  const accent = items[0]?.color ?? items[0]?.projectColor ?? defaultActivityColor;
  const isLight = theme === "light";

  return {
    total: items.length,
    tasks,
    events,
    accent,
    surfaceStyle:
      items.length > 0
        ? {
            background: isLight
              ? `radial-gradient(circle at top right, ${withAlpha(accent, "1A")} 0%, transparent 42%), linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 247, 255, 0.96) 100%)`
              : `linear-gradient(160deg, ${withAlpha(accent, "26")} 0%, rgba(15, 23, 42, 0.88) 55%, rgba(15, 23, 42, 0.98) 100%)`,
            boxShadow: isLight ? "0 16px 30px rgba(148, 163, 184, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.96)" : undefined,
          }
        : undefined,
  };
};

const dayLabel = (date) => weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1];
const getInfoPanelStyle = (theme, accent = defaultActivityColor) => ({
  background:
    theme === "light"
      ? `radial-gradient(circle at top right, ${withAlpha(accent, "14")} 0%, transparent 38%), linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 249, 255, 0.96) 100%)`
      : `linear-gradient(180deg, rgba(15, 23, 42, 0.62) 0%, rgba(15, 23, 42, 0.82) 100%)`,
  boxShadow: theme === "light" ? "0 16px 30px rgba(148, 163, 184, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.96)" : undefined,
});

const getCounterSurfaceStyle = (theme, accent = defaultActivityColor) => ({
  borderColor: theme === "light" ? withAlpha(accent, "22") : undefined,
  background:
    theme === "light"
      ? `radial-gradient(circle at top right, ${withAlpha(accent, "12")} 0%, transparent 42%), linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 247, 255, 0.94) 100%)`
      : "rgba(15, 23, 42, 0.65)",
  boxShadow: theme === "light" ? "0 14px 28px rgba(148, 163, 184, 0.12)" : undefined,
});

const getDayCardBaseStyle = (theme) => ({
  background:
    theme === "light"
      ? "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 249, 255, 0.96) 100%)"
      : "rgba(15, 23, 42, 0.55)",
  boxShadow: theme === "light" ? "0 12px 26px rgba(148, 163, 184, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.96)" : undefined,
});

const getDayTagStyle = (accent, theme) => ({
  backgroundColor: theme === "light" ? withAlpha(accent, "12") : withAlpha(accent, "20"),
  border: `1px solid ${withAlpha(accent, theme === "light" ? "24" : "32")}`,
  color: theme === "light" ? "rgb(15 23 42)" : accent,
  boxShadow: theme === "light" ? `0 10px 18px ${withAlpha(accent, "10")}` : undefined,
});

const getMiniBadgeStyle = (accent, theme) => ({
  backgroundColor: theme === "light" ? "rgba(255, 255, 255, 0.96)" : "rgba(2, 6, 23, 0.45)",
  border: `1px solid ${theme === "light" ? withAlpha(accent, "22") : "rgba(255,255,255,0.08)"}`,
  color: theme === "light" ? "rgb(71 85 105)" : "rgba(226, 232, 240, 0.9)",
  boxShadow: theme === "light" ? "0 10px 18px rgba(148, 163, 184, 0.14)" : undefined,
});

export function CalendarPage() {
  const { data, loading, error, refetch } = useAsyncData(() => apiGet("/calendar"), []);
  const theme = useAppStore((state) => state.theme);
  const calendarView = useAppStore((state) => state.calendarView);
  const setCalendarView = useAppStore((state) => state.setCalendarView);
  const [currentMonth, setCurrentMonth] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  useEffect(() => {
    if (calendarView === "month") {
      const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      setSelectedDate((current) =>
        current.getMonth() === firstOfMonth.getMonth() && current.getFullYear() === firstOfMonth.getFullYear()
          ? current
          : startOfDay(firstOfMonth)
      );
    }
  }, [calendarView, currentMonth]);

  const normalizedItems = useMemo(
    () =>
      (data ?? []).map((item) => ({
        ...item,
        dateObject: itemDate(item),
      })),
    [data]
  );

  const monthDays = useMemo(() => {
    const first = startOfMonthGrid(currentMonth);
    const last = endOfMonthGrid(currentMonth);
    const days = [];
    const cursor = new Date(first);

    while (cursor <= last) {
      const dayDate = new Date(cursor);
      days.push({
        date: dayDate,
        items: normalizedItems.filter((item) => isSameDay(item.dateObject, dayDate)),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [currentMonth, normalizedItems]);

  const weekDaysData = useMemo(() => {
    const start = getWeekStart(selectedDate);
    return [...Array(7)].map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        date,
        items: normalizedItems.filter((item) => isSameDay(item.dateObject, date)),
      };
    });
  }, [normalizedItems, selectedDate]);

  const selectedItems = useMemo(
    () => normalizedItems.filter((item) => isSameDay(item.dateObject, selectedDate)),
    [normalizedItems, selectedDate]
  );

  const upcomingItems = useMemo(() => {
    const start = startOfDay(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return normalizedItems.filter((item) => item.dateObject >= start && item.dateObject < end);
  }, [normalizedItems]);

  const summary = useMemo(
    () => ({
      total: normalizedItems.length,
      tasks: normalizedItems.filter((item) => item.itemType === "TASK").length,
      events: normalizedItems.filter((item) => item.itemType === "EVENT").length,
      dueThisWeek: upcomingItems.length,
      completed: normalizedItems.filter((item) => item.status === "DONE").length,
    }),
    [normalizedItems, upcomingItems]
  );

  if (loading) {
    return (
      <div className="grid gap-5">
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-[620px]" />
      </div>
    );
  }

  if (error) {
    return (
      <PageShell
        description="No fue posible consultar tu agenda. Puedes volver a intentarlo sin salir de esta vista."
        kicker="Planeacion academica"
        title="Calendario operativo"
      >
        <div className="panel p-6">
          <p className="text-base font-semibold text-text">No se pudo cargar el calendario</p>
          <p className="mt-2 text-sm text-muted">{error.message}</p>
          <div className="mt-4">
            <Button onClick={() => refetch().catch(() => {})} variant="primary">
              Reintentar
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))}
            type="button"
          >
            Mes anterior
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const today = startOfDay(new Date());
              setCurrentMonth(today);
              setSelectedDate(today);
            }}
            type="button"
          >
            Hoy
          </Button>
          <Button
            onClick={() => setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))}
            type="button"
          >
            Mes siguiente
          </Button>
        </div>
      }
      description="Combina tareas y eventos academicos en una agenda semanal o mensual lista para planificar tu carga."
      kicker="Planeacion academica"
      title="Calendario operativo"
    >
      <>
        <section className="grid gap-5 xl:grid-cols-5">
          <Stat title="Elementos con fecha" value={summary.total} />
          <Stat title="Tareas" value={summary.tasks} />
          <Stat title="Eventos" value={summary.events} />
          <Stat title="Proximos 7 dias" value={summary.dueThisWeek} />
          <Stat title="Completadas" value={summary.completed} />
        </section>

        {!normalizedItems.length ? (
          <section className="panel p-4 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="section-kicker">Agenda disponible</p>
                <h2 className="mt-2 text-2xl font-semibold text-text">Tu calendario ya esta listo</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Aun no existen tareas o eventos con fecha, pero ya puedes navegar el mes y la semana para empezar a planificar.
                </p>
              </div>
              <span className="pill">Sin actividad registrada</span>
            </div>
          </section>
        ) : null}

        <section className="panel p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="section-kicker">Vista activa</p>
              <h2 className="mt-2 text-2xl font-semibold text-text">
                {calendarView === "month" ? "Calendario mensual" : "Calendario semanal"}
              </h2>
            </div>
            <Tabs value={calendarView} onValueChange={setCalendarView}>
              <TabsList>
                <TabsTrigger value="month">Mensual</TabsTrigger>
                <TabsTrigger value="week">Semanal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {calendarView === "month" ? (
          <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
            <article className="panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="section-kicker">Vista mensual</p>
                  <h3 className="mt-3 text-3xl font-semibold text-text">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                </div>
                <div className="rounded-2xl border border-border px-4 py-3 text-sm text-muted" style={getCounterSurfaceStyle(theme)}>
                  {monthDays.filter((day) => day.items.length).length} dias con actividad
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-border p-4" style={getInfoPanelStyle(theme)}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">Calendario completo del mes</p>
                    <p className="mt-1 text-sm text-muted">
                      Las fechas con tareas o eventos aparecen pintadas automaticamente para que identifiques la carga academica de un vistazo.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-muted">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2" style={getMiniBadgeStyle(defaultActivityColor, theme)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      Fecha con actividad
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2" style={getMiniBadgeStyle("#8B5CF6", theme)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                      Dia actual
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto pb-1">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {weekDays.map((day) => (
                      <div key={day} className="rounded-2xl border border-border bg-slate-900/45 px-2 py-3">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {monthDays.map((day) => {
                      const inCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
                      const isSelected = isSameDay(day.date, selectedDate);
                      const isToday = isSameDay(day.date, new Date());
                      const activity = getActivityMeta(day.items, theme);

                      return (
                        <button
                          key={day.date.toISOString()}
                          className={`relative min-h-[186px] overflow-hidden rounded-3xl border p-3 text-left transition ${
                            isSelected ? "border-primary/55" : activity.total ? "hover:border-primary/35" : "hover:border-primary/25"
                          } ${inCurrentMonth ? "text-text" : "text-muted/55"}`}
                          style={{
                            ...(!activity.total ? getDayCardBaseStyle(theme) : {}),
                            boxShadow: isSelected
                              ? theme === "light"
                                ? "0 20px 36px rgba(99, 102, 241, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.96)"
                                : "0 18px 45px rgba(99, 102, 241, 0.18)"
                              : !activity.total
                                ? getDayCardBaseStyle(theme).boxShadow
                                : activity.surfaceStyle?.boxShadow,
                            borderColor: isSelected
                              ? withAlpha(defaultActivityColor, "80")
                              : activity.total && theme === "light"
                                ? withAlpha(activity.accent, "24")
                                : undefined,
                          }}
                          onClick={() => setSelectedDate(startOfDay(day.date))}
                          type="button"
                        >
                          {activity.total ? <div className="absolute inset-0" style={activity.surfaceStyle} /> : null}
                          {isSelected ? <div className="absolute inset-0 bg-primary/10" /> : null}

                          <div className="relative z-10 flex h-full flex-col">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex min-w-[2.2rem] items-center justify-center rounded-full px-2.5 py-1 text-sm font-semibold ${
                                  isToday
                                    ? "bg-secondary/25 text-secondary"
                                    : activity.total
                                      ? theme === "light"
                                        ? "text-text"
                                        : "text-white"
                                      : ""
                                }`}
                                style={
                                  !isToday && activity.total
                                    ? {
                                        backgroundColor: `${activity.accent}26`,
                                        boxShadow: `inset 0 0 0 1px ${activity.accent}45`,
                                      }
                                    : undefined
                                }
                              >
                                {day.date.getDate()}
                              </span>
                              {activity.total ? (
                                <span className="pill text-text" style={getMiniBadgeStyle(activity.accent, theme)}>
                                  {activity.total}
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                              <span>{dayLabel(day.date)}</span>
                              {activity.total ? (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activity.accent }} />
                                  <span>Activo</span>
                                </>
                              ) : null}
                            </div>

                            <div className="mt-3 space-y-2">
                              {day.items.slice(0, 1).map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl px-3 py-2 text-[11px] font-semibold leading-4 backdrop-blur-sm"
                                  style={getDayTagStyle(item.color ?? item.projectColor ?? defaultActivityColor, theme)}
                                >
                                  <span style={clampTwoLinesStyle}>{item.title}</span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-auto pt-4">
                              {day.items.length > 1 ? (
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">+{day.items.length - 1} mas</p>
                              ) : null}
                              {activity.total ? (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
                                  {activity.tasks ? <span className="rounded-full px-2 py-1" style={getMiniBadgeStyle(activity.accent, theme)}>{activity.tasks} tareas</span> : null}
                                  {activity.events ? <span className="rounded-full px-2 py-1" style={getMiniBadgeStyle(activity.accent, theme)}>{activity.events} eventos</span> : null}
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted">Sin actividad</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>

            <DayAgenda items={selectedItems} theme={theme} title={formatDate(selectedDate.toISOString(), { withYear: true })} />
          </section>
        ) : (
          <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
            <article className="panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="section-kicker">Vista semanal</p>
                  <h3 className="mt-3 text-3xl font-semibold text-text">Semana en curso</h3>
                </div>
                <div className="rounded-2xl border border-border px-4 py-3 text-sm text-muted" style={getCounterSurfaceStyle(theme, "#22C55E")}>
                  {weekDaysData.reduce((sum, day) => sum + day.items.length, 0)} elementos programados
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-border p-4" style={getInfoPanelStyle(theme, "#22C55E")}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">Lectura semanal continua</p>
                    <p className="mt-1 text-sm text-muted">
                      La semana permanece visible aunque aun no tengas actividad. Cuando registres tareas o eventos, el dia se resalta automaticamente.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.14em] text-muted">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2" style={getMiniBadgeStyle(defaultActivityColor, theme)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      Dia seleccionado
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2" style={getMiniBadgeStyle("#22C55E", theme)}>
                      <span className="h-2.5 w-2.5 rounded-full bg-success" />
                      Actividad programada
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto pb-1">
                <div className="min-w-[920px]">
                  <div className="grid grid-cols-7 gap-3">
                    {weekDaysData.map((day) => {
                      const activity = getActivityMeta(day.items, theme);
                      const isSelected = isSameDay(day.date, selectedDate);
                      const isToday = isSameDay(day.date, new Date());

                      return (
                        <button
                          key={day.date.toISOString()}
                          className={`relative min-h-[248px] overflow-hidden rounded-3xl border p-4 text-left transition ${
                            isSelected ? "border-primary/50" : activity.total ? "hover:border-primary/30" : "hover:border-primary/25"
                          }`}
                          style={{
                            ...(!activity.total ? getDayCardBaseStyle(theme) : {}),
                            boxShadow: isSelected
                              ? theme === "light"
                                ? "0 20px 36px rgba(99, 102, 241, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.96)"
                                : "0 18px 45px rgba(99, 102, 241, 0.16)"
                              : !activity.total
                                ? getDayCardBaseStyle(theme).boxShadow
                                : activity.surfaceStyle?.boxShadow,
                            borderColor: isSelected
                              ? withAlpha(defaultActivityColor, "80")
                              : activity.total && theme === "light"
                                ? withAlpha(activity.accent, "24")
                                : undefined,
                          }}
                          onClick={() => setSelectedDate(startOfDay(day.date))}
                          type="button"
                        >
                          {activity.total ? <div className="absolute inset-0" style={activity.surfaceStyle} /> : null}
                          {isSelected ? <div className="absolute inset-0 bg-primary/8" /> : null}

                          <div className="relative z-10 flex h-full flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{dayLabel(day.date)}</p>
                                <p
                                  className={`mt-3 inline-flex min-w-[3rem] items-center justify-center rounded-full px-3 py-2 text-2xl font-semibold ${
                                    isToday ? "bg-secondary/20 text-secondary" : "text-text"
                                  }`}
                                  style={
                                    !isToday && activity.total
                                      ? {
                                          backgroundColor: `${activity.accent}20`,
                                          boxShadow: `inset 0 0 0 1px ${activity.accent}40`,
                                        }
                                      : undefined
                                  }
                                >
                                  {day.date.getDate()}
                                </p>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {activity.total ? (
                                  <span className="pill text-text" style={getMiniBadgeStyle(activity.accent, theme)}>
                                    {activity.total}
                                  </span>
                                ) : (
                                  <span className="pill">0</span>
                                )}
                                {activity.total ? (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={getMiniBadgeStyle(activity.accent, theme)}>
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activity.accent }} />
                                    Activo
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              {day.items.length ? (
                                day.items.slice(0, 2).map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-2xl px-3 py-2 text-[11px] font-semibold leading-5 backdrop-blur-sm"
                                    style={getDayTagStyle(item.color ?? item.projectColor ?? defaultActivityColor, theme)}
                                  >
                                    <span style={clampTwoLinesStyle}>{item.title}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-2xl border border-dashed border-border/80 px-3 py-4 text-xs leading-5 text-muted">
                                  No hay actividad programada para este dia.
                                </div>
                              )}
                            </div>

                            <div className="mt-auto pt-4">
                              {day.items.length > 2 ? (
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">+{day.items.length - 2} mas</p>
                              ) : null}

                              {activity.total ? (
                                <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
                                  {activity.tasks ? <span className="rounded-full px-2 py-1" style={getMiniBadgeStyle(activity.accent, theme)}>{activity.tasks} tareas</span> : null}
                                  {activity.events ? <span className="rounded-full px-2 py-1" style={getMiniBadgeStyle(activity.accent, theme)}>{activity.events} eventos</span> : null}
                                </div>
                              ) : (
                                <p className="text-[11px] text-muted">Espacio libre para planificar</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>

            <DayAgenda items={selectedItems} theme={theme} title={formatDate(selectedDate.toISOString(), { withYear: true })} />
          </section>
        )}
      </>
    </PageShell>
  );
}

function DayAgenda({ items, title, theme }) {
  return (
    <section className="space-y-5">
      <article className="panel p-6">
        <p className="section-kicker">Dia seleccionado</p>
        <h3 className="mt-3 text-2xl font-semibold text-text">{title}</h3>

        <div className="mt-6 space-y-3">
          {items.length ? (
            items.map((item) => (
              <div key={`${item.itemType}-${item.id}`} className="rounded-3xl border border-border p-4" style={getDayCardBaseStyle(theme)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color ?? item.projectColor ?? "#6366F1" }} />
                      <p className="font-semibold text-text">{item.title}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted">{item.subjectName ?? item.projectTitle ?? "Agenda personal"}</p>
                  </div>
                  <span className="pill">{item.itemType === "TASK" ? "Tarea" : "Evento"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.itemType === "TASK" ? (
                    <>
                      <StatusBadge value={item.priority} />
                      <StatusBadge value={item.status} />
                      <span className="pill">
                        {item.completedSubtasks}/{item.totalSubtasks} subtareas
                      </span>
                    </>
                  ) : (
                    <span className="pill">{getEventTypeLabel(item.eventType ?? item.status)}</span>
                  )}
                </div>
                <p className="mt-4 text-xs text-muted">{formatDate(item.startAt ?? item.dueDate, { withYear: true, withTime: true })}</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted">
              No hay actividad registrada para este dia.
            </div>
          )}
        </div>
      </article>

      <article className="panel p-6">
        <p className="section-kicker">Ventana critica</p>
        <h3 className="mt-3 text-2xl font-semibold text-text">Referencia de uso</h3>
        <div className="mt-6 rounded-3xl border border-border p-5 text-sm leading-6 text-muted" style={getInfoPanelStyle(theme, "#0EA5E9")}>
          Usa la vista semanal para distribuir bloques de trabajo y la mensual para revisar entregas, clases y
          reuniones importantes del semestre.
        </div>
      </article>
    </section>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-3xl border border-border p-4 surface-tile">
      <p className="text-sm text-muted">{title}</p>
      <strong className="mt-3 block text-3xl font-semibold text-text">{value}</strong>
    </div>
  );
}
