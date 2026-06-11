import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../lib/api-client";
import { formatDate } from "../lib/formatters";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
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

export function CalendarPage() {
  const { data, loading, error, refetch } = useAsyncData(() => apiGet("/calendar"), []);
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
      <EmptyState
        action={
          <Button onClick={() => refetch().catch(() => {})} variant="primary">
            Reintentar
          </Button>
        }
        description={error.message}
        title="No se pudo cargar el calendario"
      />
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
      {!normalizedItems.length ? (
        <EmptyState
          description="Cuando las tareas o eventos tengan fecha, apareceran aqui para planificar la semana y el mes."
          title="No hay actividad programada"
        />
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-5">
            <Stat title="Elementos con fecha" value={summary.total} />
            <Stat title="Tareas" value={summary.tasks} />
            <Stat title="Eventos" value={summary.events} />
            <Stat title="Proximos 7 dias" value={summary.dueThisWeek} />
            <Stat title="Completadas" value={summary.completed} />
          </section>

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
                  <div className="rounded-2xl border border-border bg-slate-900/65 px-4 py-3 text-sm text-muted">
                    {monthDays.filter((day) => day.items.length).length} dias con actividad
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted">
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

                    return (
                      <button
                        key={day.date.toISOString()}
                        className={`min-h-[108px] rounded-3xl border p-3 text-left transition ${
                          isSelected
                            ? "border-primary/50 bg-primary/12"
                            : "border-border bg-slate-900/55 hover:border-primary/25"
                        } ${inCurrentMonth ? "text-text" : "text-muted/55"}`}
                        onClick={() => setSelectedDate(startOfDay(day.date))}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${isToday ? "rounded-full bg-secondary/20 px-2 py-1 text-secondary" : ""}`}>
                            {day.date.getDate()}
                          </span>
                          {day.items.length ? <span className="pill">{day.items.length}</span> : null}
                        </div>

                        <div className="mt-4 space-y-2">
                          {day.items.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${item.color ?? item.projectColor ?? "#6366F1"}20`,
                                color: item.color ?? item.projectColor ?? "#6366F1",
                              }}
                            >
                              {item.title}
                            </div>
                          ))}
                          {day.items.length > 2 ? (
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">+{day.items.length - 2} mas</p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>

              <DayAgenda items={selectedItems} title={formatDate(selectedDate.toISOString(), { withYear: true })} />
            </section>
          ) : (
            <section className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
              <article className="panel p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="section-kicker">Vista semanal</p>
                    <h3 className="mt-3 text-3xl font-semibold text-text">Semana en curso</h3>
                  </div>
                  <div className="rounded-2xl border border-border bg-slate-900/65 px-4 py-3 text-sm text-muted">
                    {weekDaysData.reduce((sum, day) => sum + day.items.length, 0)} elementos programados
                  </div>
                </div>

                <div className="mt-6 grid gap-3 lg:grid-cols-7">
                  {weekDaysData.map((day) => (
                    <button
                      key={day.date.toISOString()}
                      className={`rounded-3xl border p-4 text-left transition ${
                        isSameDay(day.date, selectedDate)
                          ? "border-primary/50 bg-primary/12"
                          : "border-border bg-slate-900/55 hover:border-primary/25"
                      }`}
                      onClick={() => setSelectedDate(startOfDay(day.date))}
                      type="button"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        {weekDays[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-text">{day.date.getDate()}</p>
                      <div className="mt-4 space-y-2">
                        {day.items.length ? (
                          day.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${item.color ?? item.projectColor ?? "#6366F1"}20`,
                                color: item.color ?? item.projectColor ?? "#6366F1",
                              }}
                            >
                              {item.title}
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted">Sin actividad</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </article>

              <DayAgenda items={selectedItems} title={formatDate(selectedDate.toISOString(), { withYear: true })} />
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}

function DayAgenda({ items, title }) {
  return (
    <section className="space-y-5">
      <article className="panel p-6">
        <p className="section-kicker">Dia seleccionado</p>
        <h3 className="mt-3 text-2xl font-semibold text-text">{title}</h3>

        <div className="mt-6 space-y-3">
          {items.length ? (
            items.map((item) => (
              <div key={`${item.itemType}-${item.id}`} className="rounded-3xl border border-border bg-slate-900/65 p-4">
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
                    <span className="pill">{item.eventType ?? item.status}</span>
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
        <div className="mt-6 rounded-3xl border border-border bg-slate-900/55 p-5 text-sm leading-6 text-muted">
          Usa la vista semanal para distribuir bloques de trabajo y la mensual para revisar entregas, clases y
          reuniones importantes del semestre.
        </div>
      </article>
    </section>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-3xl border border-border bg-slate-900/65 p-4">
      <p className="text-sm text-muted">{title}</p>
      <strong className="mt-3 block text-3xl font-semibold text-text">{value}</strong>
    </div>
  );
}
