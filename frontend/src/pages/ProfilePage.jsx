import { useMemo, useState } from "react";
import { BookOpen, CalendarRange, GraduationCap, MoonStar, Plus, SunMedium, Trash2, UserRound } from "lucide-react";
import { apiDelete, apiGet, apiPost } from "../lib/api-client";
import { getEventTypeLabel } from "../lib/display-labels";
import { formatDate, getCurrentInputDateTime, isPastInputDateTime, toInputDateTime } from "../lib/formatters";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAppStore } from "../store/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Separator } from "../components/ui/Separator";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { Switch } from "../components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { Textarea } from "../components/ui/Textarea";

const emptyTermForm = {
  name: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const emptySubjectForm = {
  academicTermId: "",
  name: "",
  code: "",
  instructor: "",
  color: "#6366F1",
};

const emptyEventForm = {
  subjectId: "",
  projectId: "",
  title: "",
  description: "",
  startAt: "",
  endAt: "",
  type: "PERSONAL",
  color: "#0EA5E9",
};

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { pushToast } = useToast();
  const currentDateTime = getCurrentInputDateTime();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const overviewQuery = useAsyncData(() => apiGet("/academics/overview"), []);
  const projectsQuery = useAsyncData(() => apiGet("/projects"), []);

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    avatarUrl: user?.avatarUrl ?? "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [termForm, setTermForm] = useState(emptyTermForm);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [pendingAction, setPendingAction] = useState("");

  const initials = useMemo(
    () =>
      String(profileForm.name || user?.name || "NT")
        .split(" ")
        .slice(0, 2)
        .map((chunk) => chunk[0] ?? "")
        .join("")
        .toUpperCase(),
    [profileForm.name, user?.name]
  );

  const refreshAcademics = async () => {
    await overviewQuery.refetch().catch(() => {});
    await projectsQuery.refetch().catch(() => {});
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);

    try {
      await updateProfile({
        name: profileForm.name.trim(),
        avatarUrl: profileForm.avatarUrl.trim(),
      });
      pushToast({
        title: "Perfil actualizado",
        description: "Tus datos quedaron guardados correctamente.",
        tone: "success",
      });
    } catch (error) {
      pushToast({
        title: "No se pudo actualizar el perfil",
        description: error.message,
        tone: "error",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const submitTerm = async (event) => {
    event.preventDefault();
    setPendingAction("term");

    try {
      await apiPost("/academics/terms", {
        ...termForm,
        startDate: new Date(termForm.startDate).toISOString(),
        endDate: new Date(termForm.endDate).toISOString(),
      });
      setTermForm(emptyTermForm);
      await refreshAcademics();
      pushToast({ title: "Periodo creado", description: "El periodo academico ya esta disponible.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo crear el periodo", description: error.message, tone: "error" });
    } finally {
      setPendingAction("");
    }
  };

  const submitSubject = async (event) => {
    event.preventDefault();
    setPendingAction("subject");

    try {
      await apiPost("/academics/subjects", {
        ...subjectForm,
        academicTermId: subjectForm.academicTermId || null,
      });
      setSubjectForm(emptySubjectForm);
      await refreshAcademics();
      pushToast({ title: "Materia creada", description: "La materia ya forma parte de tu periodo.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo crear la materia", description: error.message, tone: "error" });
    } finally {
      setPendingAction("");
    }
  };

  const submitEvent = async (event) => {
    event.preventDefault();
    setPendingAction("event");

    if (isPastInputDateTime(eventForm.startAt) || isPastInputDateTime(eventForm.endAt)) {
      pushToast({
        title: "Fecha no valida",
        description: "Las fechas del evento deben ser actuales o futuras.",
        tone: "error",
      });
      setPendingAction("");
      return;
    }

    if (new Date(eventForm.endAt).getTime() < new Date(eventForm.startAt).getTime()) {
      pushToast({
        title: "Horario no valido",
        description: "La fecha de fin debe ser posterior o igual a la fecha de inicio.",
        tone: "error",
      });
      setPendingAction("");
      return;
    }

    try {
      await apiPost("/academics/events", {
        ...eventForm,
        subjectId: eventForm.subjectId || null,
        projectId: eventForm.projectId || null,
        startAt: new Date(eventForm.startAt).toISOString(),
        endAt: new Date(eventForm.endAt).toISOString(),
      });
      setEventForm(emptyEventForm);
      await refreshAcademics();
      pushToast({ title: "Evento creado", description: "El calendario ya fue actualizado.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo crear el evento", description: error.message, tone: "error" });
    } finally {
      setPendingAction("");
    }
  };

  const deleteTerm = async (termId) => {
    setPendingAction(termId);
    try {
      await apiDelete(`/academics/terms/${termId}`);
      await refreshAcademics();
      pushToast({ title: "Periodo eliminado", description: "El periodo fue retirado correctamente.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo eliminar el periodo", description: error.message, tone: "error" });
    } finally {
      setPendingAction("");
    }
  };

  const deleteSubject = async (subjectId) => {
    setPendingAction(subjectId);
    try {
      await apiDelete(`/academics/subjects/${subjectId}`);
      await refreshAcademics();
      pushToast({ title: "Materia eliminada", description: "La materia fue retirada.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo eliminar la materia", description: error.message, tone: "error" });
    } finally {
      setPendingAction("");
    }
  };

  const deleteEvent = async (eventId) => {
    setPendingAction(eventId);
    try {
      await apiDelete(`/academics/events/${eventId}`);
      await refreshAcademics();
      pushToast({ title: "Evento eliminado", description: "La agenda fue actualizada.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo eliminar el evento", description: error.message, tone: "error" });
    } finally {
      setPendingAction("");
    }
  };

  if (overviewQuery.loading || projectsQuery.loading) {
    return (
      <div className="grid gap-5">
        <SkeletonCard className="h-[180px]" />
        <SkeletonCard className="h-[620px]" />
      </div>
    );
  }

  if (overviewQuery.error) {
    return (
      <EmptyState
        action={
          <Button onClick={() => overviewQuery.refetch().catch(() => {})} variant="primary">
            Reintentar
          </Button>
        }
        description={overviewQuery.error.message}
        title="No se pudo cargar el perfil"
      />
    );
  }

  const overview = overviewQuery.data;
  const projects = projectsQuery.data ?? [];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/20 bg-primary-glow">
        <CardContent className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr,0.9fr] xl:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 rounded-[28px] ring-1 ring-white/10">
              <AvatarImage alt={user?.name} src={profileForm.avatarUrl || user?.avatarUrl || ""} />
              <AvatarFallback className="rounded-[28px] text-xl">{initials}</AvatarFallback>
            </Avatar>

            <div>
              <p className="section-kicker">Perfil de usuario</p>
              <h1 className="mt-2 text-3xl font-semibold text-text">{user?.name ?? "Usuario NovaTask"}</h1>
              <p className="mt-2 text-sm leading-6 text-muted">{user?.email}</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Gestiona tu cuenta, organiza tus materias y adapta la interfaz a tu ritmo de trabajo.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric icon={GraduationCap} label="Materias activas" value={overview.stats.totalSubjects} />
            <MiniMetric icon={CalendarRange} label="Eventos en agenda" value={overview.stats.totalEvents} />
            <MiniMetric icon={BookOpen} label="Periodos creados" value={overview.stats.totalTerms} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cuenta">
        <TabsList>
          <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
          <TabsTrigger value="academico">Academico</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="cuenta">
          <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la cuenta</CardTitle>
                <CardDescription>Actualiza tu nombre visible y la imagen asociada a tu perfil.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submitProfile}>
                  <Field label="Nombre completo">
                    <Input value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
                  </Field>
                  <Field label="Correo electronico">
                    <Input disabled value={user?.email ?? ""} />
                  </Field>
                  <Field label="Enlace del avatar">
                    <Input
                      placeholder="https://..."
                      value={profileForm.avatarUrl}
                      onChange={(event) => setProfileForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                    />
                  </Field>
                  <div className="flex justify-end">
                    <Button disabled={profileSaving || profileForm.name.trim().length < 3} type="submit">
                      {profileSaving ? "Guardando..." : "Guardar perfil"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferencias visuales</CardTitle>
                <CardDescription>NovaTask inicia en oscuro, pero aqui puedes alternar entre ambos modos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4 rounded-3xl border border-border bg-slate-900/50 p-4">
                  <div>
                    <p className="font-semibold text-text">Tema de la interfaz</p>
                    <p className="mt-2 text-sm text-muted">Cambia entre un entorno oscuro o uno claro sin salir de la app.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoonStar className="h-4 w-4 text-muted" />
                    <Switch checked={theme === "light"} onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")} />
                    <SunMedium className="h-4 w-4 text-muted" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="font-semibold text-text">Resumen rapido</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile icon={UserRound} label="Nombre actual" value={user?.name ?? "Sin definir"} />
                    <InfoTile icon={theme === "dark" ? MoonStar : SunMedium} label="Tema activo" value={theme === "dark" ? "Oscuro" : "Claro"} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academico">
          <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Periodo academico</CardTitle>
                <CardDescription>Define el semestre actual y marca el periodo activo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <form className="space-y-4" onSubmit={submitTerm}>
                  <Field label="Nombre del periodo">
                    <Input value={termForm.name} onChange={(event) => setTermForm((current) => ({ ...current, name: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Inicio">
                      <Input type="datetime-local" value={termForm.startDate} onChange={(event) => setTermForm((current) => ({ ...current, startDate: event.target.value }))} />
                    </Field>
                    <Field label="Fin">
                      <Input type="datetime-local" value={termForm.endDate} onChange={(event) => setTermForm((current) => ({ ...current, endDate: event.target.value }))} />
                    </Field>
                  </div>
                  <label className="flex items-center justify-between rounded-2xl border border-border bg-slate-900/55 px-4 py-3">
                    <span className="text-sm text-text">Marcar como periodo activo</span>
                    <Switch checked={termForm.isActive} onCheckedChange={(checked) => setTermForm((current) => ({ ...current, isActive: checked }))} />
                  </label>
                  <Button className="w-full" disabled={pendingAction === "term" || !termForm.name || !termForm.startDate || !termForm.endDate} type="submit">
                    <Plus className="h-4 w-4" />
                    {pendingAction === "term" ? "Guardando..." : "Crear periodo"}
                  </Button>
                </form>

                <div className="space-y-3">
                  {(overview.terms ?? []).map((term) => (
                    <div key={term.id} className="rounded-3xl border border-border bg-slate-900/55 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text">{term.name}</p>
                          <p className="mt-2 text-xs text-muted">
                            {formatDate(term.startDate, { withYear: true })} - {formatDate(term.endDate, { withYear: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {term.isActive ? <span className="pill">Activo</span> : null}
                          <Button size="icon" variant="ghost" onClick={() => deleteTerm(term.id)} type="button">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Materias activas</CardTitle>
                <CardDescription>Registra materias PUCE y enlazalas con proyectos y agenda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <form className="space-y-4" onSubmit={submitSubject}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nombre">
                      <Input value={subjectForm.name} onChange={(event) => setSubjectForm((current) => ({ ...current, name: event.target.value }))} />
                    </Field>
                    <Field label="Codigo">
                      <Input value={subjectForm.code} onChange={(event) => setSubjectForm((current) => ({ ...current, code: event.target.value }))} />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Docente">
                      <Input value={subjectForm.instructor} onChange={(event) => setSubjectForm((current) => ({ ...current, instructor: event.target.value }))} />
                    </Field>
                    <Field label="Periodo">
                      <select className="input" value={subjectForm.academicTermId} onChange={(event) => setSubjectForm((current) => ({ ...current, academicTermId: event.target.value }))}>
                        <option value="">Sin asignar</option>
                        {(overview.terms ?? []).map((term) => (
                          <option key={term.id} value={term.id}>
                            {term.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Color">
                    <Input className="h-12 p-2" type="color" value={subjectForm.color} onChange={(event) => setSubjectForm((current) => ({ ...current, color: event.target.value }))} />
                  </Field>
                  <Button className="w-full" disabled={pendingAction === "subject" || subjectForm.name.trim().length < 3} type="submit">
                    <Plus className="h-4 w-4" />
                    {pendingAction === "subject" ? "Guardando..." : "Agregar materia"}
                  </Button>
                </form>

                <div className="grid gap-3 md:grid-cols-2">
                  {(overview.subjects ?? []).map((subject) => (
                    <div key={subject.id} className="rounded-3xl border border-border bg-slate-900/55 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                            <p className="font-semibold text-text">{subject.name}</p>
                          </div>
                          <p className="mt-2 text-xs text-muted">
                            {subject.code || "Sin codigo"} - {subject.instructor || "Sin docente"}
                          </p>
                          <p className="mt-2 text-xs text-muted">{subject.academicTerm?.name ?? "Sin periodo"}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteSubject(subject.id)} type="button">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agenda">
          <div className="grid gap-5 xl:grid-cols-[0.95fr,1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Nuevo evento</CardTitle>
                <CardDescription>Registra clases, examenes, reuniones o bloques personales.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submitEvent}>
                  <Field label="Titulo">
                    <Input value={eventForm.title} onChange={(event) => setEventForm((current) => ({ ...current, title: event.target.value }))} />
                  </Field>
                  <Field label="Descripcion">
                    <Textarea value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Inicio">
                      <Input min={currentDateTime} type="datetime-local" value={eventForm.startAt} onChange={(event) => setEventForm((current) => ({ ...current, startAt: event.target.value }))} />
                    </Field>
                    <Field label="Fin">
                      <Input min={currentDateTime} type="datetime-local" value={eventForm.endAt} onChange={(event) => setEventForm((current) => ({ ...current, endAt: event.target.value }))} />
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Tipo">
                      <select className="input" value={eventForm.type} onChange={(event) => setEventForm((current) => ({ ...current, type: event.target.value }))}>
                        {["CLASS", "EXAM", "MEETING", "PERSONAL", "DEADLINE"].map((type) => (
                          <option key={type} value={type}>
                            {getEventTypeLabel(type)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Materia">
                      <select className="input" value={eventForm.subjectId} onChange={(event) => setEventForm((current) => ({ ...current, subjectId: event.target.value }))}>
                        <option value="">Sin materia</option>
                        {(overview.subjects ?? []).map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Proyecto">
                      <select className="input" value={eventForm.projectId} onChange={(event) => setEventForm((current) => ({ ...current, projectId: event.target.value }))}>
                        <option value="">Sin proyecto</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Color">
                    <Input className="h-12 p-2" type="color" value={eventForm.color} onChange={(event) => setEventForm((current) => ({ ...current, color: event.target.value }))} />
                  </Field>
                  <Button className="w-full" disabled={pendingAction === "event" || !eventForm.title || !eventForm.startAt || !eventForm.endAt} type="submit">
                    <Plus className="h-4 w-4" />
                    {pendingAction === "event" ? "Guardando..." : "Crear evento"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agenda registrada</CardTitle>
                <CardDescription>Estos eventos se integran de forma directa en la vista semanal y mensual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(overview.events ?? []).length ? (
                  overview.events.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-border bg-slate-900/55 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <p className="font-semibold text-text">{item.title}</p>
                          </div>
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">{getEventTypeLabel(item.type)}</p>
                          <p className="mt-3 text-sm text-muted">
                            {formatDate(item.startAt, { withYear: true, withTime: true })}
                          </p>
                          <p className="mt-2 text-xs text-muted">
                            {item.subject?.name ?? "Sin materia"} - {item.project?.title ?? "Sin proyecto"}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteEvent(item.id)} type="button">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-muted">
                    Todavia no has registrado eventos en la agenda.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text">{label}</span>
      {children}
    </label>
  );
}

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-border bg-slate-900/55 p-4">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted">{label}</p>
      </div>
      <strong className="mt-4 block text-3xl font-semibold text-text">{value}</strong>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-border bg-slate-900/55 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm text-muted">{label}</p>
      </div>
      <p className="mt-3 font-semibold text-text">{value}</p>
    </div>
  );
}
