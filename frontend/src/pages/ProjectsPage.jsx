import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GraduationCap, LayoutGrid, ListTodo, Search } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api-client";
import { formatDate, toInputDateTime } from "../lib/formatters";
import { sendBrowserNotification } from "../lib/notifications";
import { useAsyncData } from "../hooks/useAsyncData";
import { useAppStore } from "../store/useAppStore";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { SkeletonCard } from "../components/ui/SkeletonCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useToast } from "../context/ToastContext";

const statuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const statusLabels = {
  TODO: "Por hacer",
  IN_PROGRESS: "En curso",
  REVIEW: "Revision",
  DONE: "Hecho",
};
const priorityOptions = ["HIGH", "MEDIUM", "LOW"];
const timingOptions = [
  { value: "ALL", label: "Todo plazo" },
  { value: "OVERDUE", label: "Vencidas" },
  { value: "THIS_WEEK", label: "Esta semana" },
  { value: "UNSCHEDULED", label: "Sin fecha" },
];

const emptyProjectForm = {
  title: "",
  description: "",
  color: "#6366F1",
  dueDate: "",
  subjectId: "",
};

const emptyTaskForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
  tagIds: [],
};

const emptyTagForm = {
  name: "",
  color: "#8B5CF6",
};

const notifyTaskCompleted = async (taskTitle, pushToast) => {
  pushToast({
    title: "Tarea completada",
    description: `"${taskTitle}" se marco como completada. Si tu correo esta configurado, tambien recibiras un aviso.`,
    tone: "success",
  });

  await sendBrowserNotification({
    title: "Tarea completada",
    body: `"${taskTitle}" ya esta lista.`,
  }).catch(() => {});
};

const sortTasksByPosition = (tasks) => [...tasks].sort((left, right) => left.position - right.position);

const moveBoardTask = (tasks, taskId, nextStatus, nextPosition) => {
  const movingTask = tasks.find((task) => task.id === taskId);
  if (!movingTask) return tasks;

  const columns = Object.fromEntries(
    statuses.map((status) => [status, sortTasksByPosition(tasks.filter((task) => task.status === status))])
  );

  columns[movingTask.status] = columns[movingTask.status].filter((task) => task.id !== taskId);

  const destination = columns[nextStatus] ?? [];
  const insertIndex = Math.max(0, Math.min(nextPosition, destination.length));
  destination.splice(insertIndex, 0, {
    ...movingTask,
    status: nextStatus,
  });

  return statuses.flatMap((status) =>
    columns[status].map((task, index) => ({
      ...task,
      status,
      position: index,
    }))
  );
};

const applyTaskFilters = (tasks, filters) => {
  const now = new Date();
  const weekLimit = new Date(now);
  weekLimit.setDate(weekLimit.getDate() + 7);
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (
      query &&
      ![task.title, task.description ?? "", task.priority, task.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    ) {
      return false;
    }

    if (filters.status !== "ALL" && task.status !== filters.status) {
      return false;
    }

    if (filters.priority !== "ALL" && task.priority !== filters.priority) {
      return false;
    }

    if (filters.tag !== "ALL" && !task.taskTags.some((entry) => entry.tagId === filters.tag)) {
      return false;
    }

    if (filters.timing === "OVERDUE") {
      return Boolean(task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE");
    }

    if (filters.timing === "THIS_WEEK") {
      return Boolean(task.dueDate && new Date(task.dueDate) >= now && new Date(task.dueDate) <= weekLimit);
    }

    if (filters.timing === "UNSCHEDULED") {
      return !task.dueDate;
    }

    return true;
  });
};

const getListSortValue = (task) => (task.dueDate ? new Date(task.dueDate).getTime() : Number.MAX_SAFE_INTEGER);

export function ProjectsPage({
  forcedView = null,
  shellTitle = "Tus proyectos",
  shellKicker = "Espacio de trabajo",
  shellDescription = "Organiza tus proyectos, crea tareas, usa filtros y sigue el avance desde un tablero visual.",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const projectView = useAppStore((state) => state.projectView);
  const setProjectView = useAppStore((state) => state.setProjectView);
  const activeView = forcedView ?? projectView;
  const projectsQuery = useAsyncData(() => apiGet("/projects"), []);
  const tagsQuery = useAsyncData(() => apiGet("/tags"), []);
  const academicsQuery = useAsyncData(() => apiGet("/academics/overview"), []);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectModal, setProjectModal] = useState({ open: false, mode: "create" });
  const [taskModal, setTaskModal] = useState({ open: false, mode: "create", task: null });
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [tagForm, setTagForm] = useState(emptyTagForm);
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const [subtaskPendingId, setSubtaskPendingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [timingFilter, setTimingFilter] = useState("ALL");
  const [boardTasks, setBoardTasks] = useState([]);
  const [activeDragId, setActiveDragId] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const detailQuery = useAsyncData(
    () => apiGet(`/projects/${selectedProjectId}`),
    [selectedProjectId],
    Boolean(selectedProjectId)
  );

  useEffect(() => {
    if (projectsQuery.data?.length && !selectedProjectId) {
      setSelectedProjectId(projectsQuery.data[0].id);
    }
  }, [projectsQuery.data, selectedProjectId]);

  useEffect(() => {
    const pendingProjectId = location.state?.selectedProjectId;
    if (!pendingProjectId || !projectsQuery.data?.some((project) => project.id === pendingProjectId)) {
      return;
    }

    setSelectedProjectId(pendingProjectId);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, projectsQuery.data]);

  useEffect(() => {
    setBoardTasks(detailQuery.data?.tasks ?? []);
  }, [detailQuery.data?.tasks]);

  const activeFilters = useMemo(
    () => ({
      query: deferredSearch,
      status: statusFilter,
      priority: priorityFilter,
      tag: tagFilter,
      timing: timingFilter,
    }),
    [deferredSearch, priorityFilter, statusFilter, tagFilter, timingFilter]
  );

  const filteredTasks = useMemo(() => applyTaskFilters(boardTasks, activeFilters), [activeFilters, boardTasks]);

  const filteredColumns = useMemo(
    () =>
      Object.fromEntries(
        statuses.map((status) => [status, sortTasksByPosition(filteredTasks.filter((task) => task.status === status))])
      ),
    [filteredTasks]
  );

  const fullColumns = useMemo(
    () =>
      Object.fromEntries(
        statuses.map((status) => [status, sortTasksByPosition(boardTasks.filter((task) => task.status === status))])
      ),
    [boardTasks]
  );

  const isFilterActive =
    Boolean(deferredSearch.trim()) ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    tagFilter !== "ALL" ||
    timingFilter !== "ALL";

  const projectInsights = useMemo(() => {
    const total = boardTasks.length;
    const completed = boardTasks.filter((task) => task.status === "DONE").length;
    const active = boardTasks.filter((task) => task.status === "IN_PROGRESS" || task.status === "REVIEW").length;
    const overdue = boardTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE").length;
    const dueSoon = boardTasks.filter((task) => {
      if (!task.dueDate || task.status === "DONE") return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return dueDate >= today && dueDate <= nextWeek;
    }).length;
    const totalSubtasks = boardTasks.reduce((sum, task) => sum + task.subtasks.length, 0);
    const completedSubtasks = boardTasks.reduce(
      (sum, task) => sum + task.subtasks.filter((subtask) => subtask.completed).length,
      0
    );
    const nextDeadlineTask =
      [...boardTasks]
        .filter((task) => task.dueDate && task.status !== "DONE")
        .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))[0] ?? null;

    return {
      total,
      completed,
      active,
      overdue,
      dueSoon,
      totalSubtasks,
      completedSubtasks,
      nextDeadlineTask,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      tagPool: Array.from(
        new Map(
          boardTasks
            .flatMap((task) => task.taskTags)
            .filter((entry) => entry.tag)
            .map((entry) => [entry.tag.id, entry.tag])
        ).values()
      ),
    };
  }, [boardTasks]);

  const activeTask = useMemo(
    () => boardTasks.find((task) => task.id === activeDragId) ?? null,
    [activeDragId, boardTasks]
  );

  const subjects = academicsQuery.data?.subjects ?? [];

  const openProjectModal = (mode) => {
    if (mode === "edit" && detailQuery.data) {
      setProjectForm({
        title: detailQuery.data.title,
        description: detailQuery.data.description ?? "",
        color: detailQuery.data.color,
        dueDate: toInputDateTime(detailQuery.data.dueDate),
        subjectId: detailQuery.data.subject?.id ?? "",
      });
    } else {
      setProjectForm(emptyProjectForm);
    }
    setProjectModal({ open: true, mode });
  };

  const openTaskModal = (mode, task = null) => {
    if (mode === "edit" && task) {
      setTaskForm({
        title: task.title,
        description: task.description ?? "",
        priority: task.priority,
        status: task.status,
        dueDate: toInputDateTime(task.dueDate),
        tagIds: task.taskTags.map((entry) => entry.tagId),
      });
    } else {
      setTaskForm(emptyTaskForm);
    }

    setSubtaskDraft("");
    setTaskModal({ open: true, mode, task });
  };

  const openTagModal = () => {
    setTagForm(emptyTagForm);
    setTagModalOpen(true);
  };

  const syncTaskModalTask = (detailData, taskId) => {
    const nextTask = detailData?.tasks?.find((task) => task.id === taskId) ?? null;

    setTaskModal((current) =>
      current.open && current.task?.id === taskId
        ? {
            ...current,
            task: nextTask ?? current.task,
          }
        : current
    );

    return nextTask;
  };

  const refreshAll = async ({ projectId = selectedProjectId, taskId = null } = {}) => {
    const [projects, detail] = await Promise.all([
      projectsQuery.refetch().catch(() => null),
      projectId ? apiGet(`/projects/${projectId}`).catch(() => null) : Promise.resolve(null),
    ]);

    detailQuery.setData(detail);
    setBoardTasks(detail?.tasks ?? []);

    if (taskId && detail?.tasks) {
      syncTaskModalTask(detail, taskId);
    }

    return { projects, detail };
  };

  const submitProject = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...projectForm,
        subjectId: projectForm.subjectId || null,
        dueDate: projectForm.dueDate ? new Date(projectForm.dueDate).toISOString() : null,
      };

      if (projectModal.mode === "create") {
        const created = await apiPost("/projects", payload);
        pushToast({ title: "Proyecto creado", description: "El proyecto ya esta disponible.", tone: "success" });
        setSelectedProjectId(created.id);
        await refreshAll({ projectId: created.id });
      } else {
        await apiPatch(`/projects/${selectedProjectId}`, payload);
        pushToast({ title: "Proyecto actualizado", description: "Se guardaron los cambios.", tone: "success" });
        await refreshAll();
      }
      setProjectModal({ open: false, mode: "create" });
    } catch (error) {
      pushToast({ title: "No se pudo guardar el proyecto", description: error.message, tone: "error" });
    }
  };

  const removeProject = async () => {
    if (!selectedProjectId) return;
    try {
      await apiDelete(`/projects/${selectedProjectId}`);
      pushToast({ title: "Proyecto eliminado", description: "El proyecto ya no aparece en tu lista.", tone: "success" });
      const refreshedProjects = await projectsQuery.refetch().catch(() => []);
      const nextProjectId = refreshedProjects?.[0]?.id ?? null;
      setSelectedProjectId(nextProjectId);
      const nextDetail = nextProjectId ? await apiGet(`/projects/${nextProjectId}`).catch(() => null) : null;
      detailQuery.setData(nextDetail);
      setBoardTasks(nextDetail?.tasks ?? []);
      setProjectModal({ open: false, mode: "create" });
    } catch (error) {
      pushToast({ title: "No se pudo eliminar", description: error.message, tone: "error" });
    }
  };

  const submitTask = async (event) => {
    event.preventDefault();
    try {
      const previousStatus = taskModal.mode === "edit" ? taskModal.task?.status : null;
      const payload = {
        ...taskForm,
        projectId: selectedProjectId,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
      };

      if (taskModal.mode === "create") {
        await apiPost("/tasks", payload);
        pushToast({ title: "Tarea creada", description: "La tarea fue agregada al tablero.", tone: "success" });
      } else {
        await apiPatch(`/tasks/${taskModal.task.id}`, payload);
        pushToast({ title: "Tarea actualizada", description: "La tarea fue guardada.", tone: "success" });
      }

      await refreshAll();
      setTaskModal({ open: false, mode: "create", task: null });

      if (taskForm.status === "DONE" && previousStatus !== "DONE") {
        await notifyTaskCompleted(taskForm.title, pushToast);
      }
    } catch (error) {
      pushToast({ title: "No se pudo guardar la tarea", description: error.message, tone: "error" });
    }
  };

  const removeTask = async () => {
    if (!taskModal.task) return;
    try {
      await apiDelete(`/tasks/${taskModal.task.id}`);
      pushToast({ title: "Tarea eliminada", description: "El tablero se actualizo.", tone: "success" });
      await refreshAll();
      setTaskModal({ open: false, mode: "create", task: null });
    } catch (error) {
      pushToast({ title: "No se pudo eliminar la tarea", description: error.message, tone: "error" });
    }
  };

  const moveTaskToStatus = async (taskId, status, position) => {
    const movedTask = boardTasks.find((task) => task.id === taskId);
    const previousBoard = boardTasks;
    const optimisticBoard = moveBoardTask(boardTasks, taskId, status, position);

    setBoardTasks(optimisticBoard);

    try {
      await apiPatch(`/tasks/${taskId}/move`, { status, position });
      await refreshAll({ taskId });
      pushToast({ title: "Tarea movida", description: "La tarea se actualizo correctamente.", tone: "success" });

      if (status === "DONE" && movedTask?.status !== "DONE") {
        await notifyTaskCompleted(movedTask.title, pushToast);
      }
    } catch (error) {
      setBoardTasks(previousBoard);
      pushToast({ title: "No se pudo mover la tarea", description: error.message, tone: "error" });
    }
  };

  const createSubtask = async () => {
    if (!taskModal.task || !subtaskDraft.trim()) return;

    try {
      setSubtaskPendingId("create");
      await apiPost(`/tasks/${taskModal.task.id}/subtasks`, {
        title: subtaskDraft.trim(),
      });
      await refreshAll({ taskId: taskModal.task.id });
      setSubtaskDraft("");
      pushToast({ title: "Subtarea creada", description: "La checklist se actualizo.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo crear la subtarea", description: error.message, tone: "error" });
    } finally {
      setSubtaskPendingId(null);
    }
  };

  const toggleSubtask = async (subtask) => {
    if (!taskModal.task) return;

    try {
      setSubtaskPendingId(subtask.id);
      await apiPatch(`/tasks/subtasks/${subtask.id}`, {
        completed: !subtask.completed,
      });
      await refreshAll({ taskId: taskModal.task.id });
      pushToast({ title: "Subtarea actualizada", description: "Se guardo el progreso.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo actualizar la subtarea", description: error.message, tone: "error" });
    } finally {
      setSubtaskPendingId(null);
    }
  };

  const removeSubtask = async (subtaskId) => {
    if (!taskModal.task) return;

    try {
      setSubtaskPendingId(subtaskId);
      await apiDelete(`/tasks/subtasks/${subtaskId}`);
      await refreshAll({ taskId: taskModal.task.id });
      pushToast({ title: "Subtarea eliminada", description: "La tarea quedo actualizada.", tone: "success" });
    } catch (error) {
      pushToast({ title: "No se pudo eliminar la subtarea", description: error.message, tone: "error" });
    } finally {
      setSubtaskPendingId(null);
    }
  };

  const submitTag = async (event) => {
    event.preventDefault();

    try {
      const created = await apiPost("/tags", {
        name: tagForm.name.trim(),
        color: tagForm.color,
      });

      await tagsQuery.refetch().catch(() => {});
      setTagForm(emptyTagForm);
      setTagModalOpen(false);
      pushToast({
        title: "Etiqueta creada",
        description: `${created.name} ya esta disponible para tus tareas.`,
        tone: "success",
      });
    } catch (error) {
      pushToast({ title: "No se pudo crear la etiqueta", description: error.message, tone: "error" });
    }
  };

  const handleDragStart = (event) => {
    if (activeView !== "kanban" || isFilterActive) return;
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = async (event) => {
    setActiveDragId(null);

    if (activeView !== "kanban" || isFilterActive || !event.over) {
      return;
    }

    const taskId = String(event.active.id);
    const overId = String(event.over.id);

    if (taskId === overId) {
      return;
    }

    let nextStatus = "TODO";
    let nextPosition = 0;

    if (overId.startsWith("column:")) {
      nextStatus = overId.replace("column:", "");
      nextPosition = fullColumns[nextStatus].filter((task) => task.id !== taskId).length;
    } else {
      const overTask = boardTasks.find((task) => task.id === overId);
      if (!overTask) {
        return;
      }

      nextStatus = overTask.status;
      nextPosition = fullColumns[nextStatus]
        .filter((task) => task.id !== taskId)
        .findIndex((task) => task.id === overId);

      if (nextPosition < 0) {
        nextPosition = fullColumns[nextStatus].filter((task) => task.id !== taskId).length;
      }
    }

    await moveTaskToStatus(taskId, nextStatus, nextPosition);
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setTagFilter("ALL");
    setTimingFilter("ALL");
    setSearch("");
  };

  if (projectsQuery.loading) {
    return (
      <div className="grid gap-5">
        <SkeletonCard className="h-28" />
        <div className="grid gap-5 xl:grid-cols-[320px,1fr]">
          <SkeletonCard className="h-[540px]" />
          <SkeletonCard className="h-[540px]" />
        </div>
      </div>
    );
  }

  return (
    <PageShell
      actions={
        <>
          {forcedView === "list" ? (
            <button className="btn-secondary" onClick={() => navigate("/app/projects")} type="button">
              Abrir Kanban
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-slate-950/65 p-1">
              <button
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeView === "kanban" ? "bg-primary text-white" : "text-muted hover:text-text"
                }`}
                onClick={() => setProjectView("kanban")}
                type="button"
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeView === "list" ? "bg-primary text-white" : "text-muted hover:text-text"
                }`}
                onClick={() => setProjectView("list")}
                type="button"
              >
                <ListTodo className="h-4 w-4" />
                Lista
              </button>
            </div>
          )}
          <button className="btn-secondary" onClick={openTagModal} type="button">
            Nueva etiqueta
          </button>
          <button className="btn-secondary" onClick={() => openProjectModal("create")} type="button">
            Nuevo proyecto
          </button>
          {selectedProjectId ? (
            <button className="btn-primary" onClick={() => openTaskModal("create")} type="button">
              Nueva tarea
            </button>
          ) : null}
        </>
      }
      description={shellDescription}
      kicker={shellKicker}
      title={shellTitle}
    >
      {!projectsQuery.data?.length ? (
        <EmptyState
          action={
            <button className="btn-primary" onClick={() => openProjectModal("create")} type="button">
              Crear primer proyecto
            </button>
          }
          description="Crea un proyecto para comenzar a registrar tareas, prioridades y deadlines."
          title="Todavia no hay proyectos"
        />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[320px,1fr]">
          <aside className="panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Portafolio</p>
                <h3 className="mt-2 text-xl font-semibold text-text">Tus proyectos</h3>
              </div>
              <span className="pill">{projectsQuery.data.length}</span>
            </div>

            <div className="mt-5 space-y-3">
              {projectsQuery.data.map((project) => {
                const isActive = selectedProjectId === project.id;
                const completionRate = project.metrics.totalTasks
                  ? Math.round((project.metrics.completedTasks / project.metrics.totalTasks) * 100)
                  : 0;

                return (
                  <button
                    key={project.id}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isActive
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-slate-900/55 hover:border-primary/20"
                    }`}
                    onClick={() => setSelectedProjectId(project.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                          <p className="truncate font-semibold text-text">{project.title}</p>
                        </div>
                        <p className="mt-2 text-xs text-muted">
                          {project.subject?.name ?? "Sin materia asociada"}
                        </p>
                      </div>
                      <span className="pill">{completionRate}%</span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted">
                      <span>{project.metrics.totalTasks} tareas</span>
                      <span>{project.metrics.completedTasks} listas</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-5">
            {detailQuery.loading ? (
              <SkeletonCard className="h-[560px]" />
            ) : detailQuery.error ? (
              <EmptyState
                action={
                  <button className="btn-primary" onClick={() => detailQuery.refetch().catch(() => {})} type="button">
                    Reintentar
                  </button>
                }
                description={detailQuery.error.message}
                title="No se pudo cargar el proyecto"
              />
            ) : !detailQuery.data ? (
              <EmptyState
                action={
                  <button className="btn-primary" onClick={() => openProjectModal("create")} type="button">
                    Crear proyecto
                  </button>
                }
                description="Crea un proyecto o selecciona otro para continuar."
                title="No hay informacion para mostrar"
              />
            ) : (
              <>
                <div className="panel p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: detailQuery.data.color }} />
                        <p className="section-kicker">Proyecto activo</p>
                        {detailQuery.data.subject ? (
                          <span className="pill inline-flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {detailQuery.data.subject.name}
                          </span>
                        ) : null}
                        {detailQuery.data.subject?.academicTerm?.name ? (
                          <span className="pill">{detailQuery.data.subject.academicTerm.name}</span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 text-3xl font-semibold text-text">{detailQuery.data.title}</h3>
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                        {detailQuery.data.description || "Sin descripcion detallada todavia."}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[340px]">
                      <div className="rounded-3xl border border-border bg-slate-950/65 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Proximo entregable</p>
                        <p className="mt-3 font-semibold text-text">
                          {projectInsights.nextDeadlineTask?.title ?? "Sin tareas pendientes"}
                        </p>
                        <p className="mt-2 text-xs text-muted">
                          {projectInsights.nextDeadlineTask
                            ? formatDate(projectInsights.nextDeadlineTask.dueDate, {
                                withYear: true,
                                withTime: true,
                              })
                            : "Agrega fechas limite para priorizar mejor"}
                        </p>
                      </div>
                      <div className="rounded-3xl border border-border bg-slate-950/65 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-muted">Checklist global</p>
                        <p className="mt-3 text-3xl font-semibold text-text">
                          {projectInsights.completedSubtasks}/{projectInsights.totalSubtasks}
                        </p>
                        <p className="mt-2 text-xs text-muted">Subtareas completadas en este proyecto.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <InsightCard label="Total tareas" value={projectInsights.total} />
                    <InsightCard label="Completadas" value={projectInsights.completed} />
                    <InsightCard label="Activas" value={projectInsights.active} />
                    <InsightCard label="Proximos 7 dias" value={projectInsights.dueSoon} />
                    <InsightCard label="Cumplimiento" value={`${projectInsights.completionRate}%`} />
                  </div>

                  <div className="mt-5 rounded-3xl border border-border bg-slate-900/55 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text">Avance del proyecto</p>
                        <p className="mt-1 text-sm text-muted">
                          {projectInsights.completionRate}% de tus tareas ya estan completadas.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {projectInsights.tagPool.length ? (
                          projectInsights.tagPool.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold"
                              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-muted">Aun no hay etiquetas aplicadas en este proyecto.</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${projectInsights.completionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
                    <div className="rounded-3xl border border-border bg-slate-950/50 p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-text">Filtros del proyecto</p>
                          <p className="mt-1 text-sm text-muted">
                            {filteredTasks.length} de {boardTasks.length} tareas visibles.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="btn-ghost px-3 py-2 text-xs" onClick={resetFilters} type="button">
                            Limpiar filtros
                          </button>
                          <button className="btn-secondary" onClick={() => openProjectModal("edit")} type="button">
                            Editar proyecto
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
                        <label className="block xl:col-span-2">
                          <span className="mb-2 block text-sm text-text">Buscar</span>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                              className="input pl-10"
                              onChange={(event) => setSearch(event.target.value)}
                              placeholder="Buscar tareas..."
                              value={search}
                            />
                          </div>
                        </label>
                        <SelectField label="Estado" onChange={setStatusFilter} options={["ALL", ...statuses]} value={statusFilter} />
                        <SelectField label="Prioridad" onChange={setPriorityFilter} options={["ALL", ...priorityOptions]} value={priorityFilter} />
                        <label className="block">
                          <span className="mb-2 block text-sm text-text">Etiqueta</span>
                          <select className="input" onChange={(event) => setTagFilter(event.target.value)} value={tagFilter}>
                            <option value="ALL">Todas</option>
                            {(tagsQuery.data ?? []).map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block lg:col-span-2 xl:col-span-1">
                          <span className="mb-2 block text-sm text-text">Tiempo</span>
                          <select className="input" onChange={(event) => setTimingFilter(event.target.value)} value={timingFilter}>
                            {timingOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-slate-950/50 p-4">
                      <p className="text-sm font-semibold text-text">Contexto academico</p>
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-2xl border border-border bg-slate-900/70 p-4">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <p className="font-semibold text-text">
                              {detailQuery.data.subject?.name ?? "Proyecto libre"}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-muted">
                            {detailQuery.data.subject?.instructor
                              ? `Docente: ${detailQuery.data.subject.instructor}`
                              : "Asocia una materia para conectar agenda, eventos y entregas."}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-slate-900/70 p-4">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-secondary" />
                            <p className="font-semibold text-text">
                              {detailQuery.data.dueDate
                                ? formatDate(detailQuery.data.dueDate, { withYear: true, withTime: true })
                                : "Sin fecha limite del proyecto"}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-muted">
                            {projectInsights.overdue
                              ? `${projectInsights.overdue} tareas vencidas requieren atencion inmediata.`
                              : "Tu proyecto no tiene tareas vencidas en este momento."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {activeView === "kanban" ? (
                  <div className="space-y-4">
                    {isFilterActive ? (
                      <div className="rounded-3xl border border-border bg-slate-950/70 px-4 py-3 text-sm text-muted">
                        El arrastre se pausa mientras hay filtros activos. Limpia los filtros para reorganizar el tablero.
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                        El tablero admite arrastrar y soltar entre columnas con guardado en la base de datos.
                      </div>
                    )}

                    <DndContext
                      collisionDetection={closestCorners}
                      onDragEnd={(event) => handleDragEnd(event).catch(() => {})}
                      onDragStart={handleDragStart}
                      sensors={sensors}
                    >
                      <div className="grid gap-4 xl:grid-cols-4">
                        {statuses.map((status) => (
                          <KanbanColumn
                            key={status}
                            columnId={`column:${status}`}
                            dragEnabled={!isFilterActive}
                            onTaskClick={(task) => openTaskModal("edit", task)}
                            tasks={filteredColumns[status]}
                            title={statusLabels[status]}
                          />
                        ))}
                      </div>

                      <DragOverlay>
                        {activeTask ? (
                          <div className="w-[280px] opacity-95">
                            <TaskCard task={activeTask} />
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                ) : (
                  <section className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InsightCard label="Pendientes" value={filteredColumns.TODO.length} />
                      <InsightCard label="En curso" value={filteredColumns.IN_PROGRESS.length} />
                      <InsightCard label="En revision" value={filteredColumns.REVIEW.length} />
                      <InsightCard label="Hechas" value={filteredColumns.DONE.length} />
                    </div>

                    {!filteredTasks.length ? (
                      <EmptyState
                        action={
                          <button className="btn-secondary" onClick={resetFilters} type="button">
                            Quitar filtros
                          </button>
                        }
                        description="Ajusta los filtros o crea una tarea nueva para comenzar."
                        title="No hay tareas visibles"
                      />
                    ) : (
                      <div className="grid gap-4">
                        {[...filteredTasks]
                          .sort((left, right) => getListSortValue(left) - getListSortValue(right))
                          .map((task) => (
                            <button
                              key={task.id}
                              className="panel w-full p-5 text-left transition hover:border-primary/30"
                              onClick={() => openTaskModal("edit", task)}
                              type="button"
                            >
                              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-lg font-semibold text-text">{task.title}</p>
                                    <StatusBadge value={task.priority} />
                                    <StatusBadge value={task.status} />
                                  </div>
                                  <p className="mt-3 text-sm leading-6 text-muted">
                                    {task.description || "Sin descripcion detallada."}
                                  </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
                                  <InfoStack
                                    label="Entrega"
                                    value={
                                      task.dueDate
                                        ? formatDate(task.dueDate, { withYear: true, withTime: true })
                                        : "Sin fecha"
                                    }
                                  />
                                  <InfoStack
                                    label="Subtareas"
                                    value={`${task.subtasks.filter((subtask) => subtask.completed).length}/${task.subtasks.length}`}
                                  />
                                  <InfoStack
                                    label="Materia"
                                    value={detailQuery.data.subject?.name ?? "Proyecto libre"}
                                  />
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {task.taskTags.length ? (
                                  task.taskTags.map((entry) => (
                                    <span
                                      key={entry.tag.id}
                                      className="rounded-full px-3 py-1 text-[11px] font-semibold"
                                      style={{ backgroundColor: `${entry.tag.color}20`, color: entry.tag.color }}
                                    >
                                      {entry.tag.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted">Sin etiquetas todavia.</span>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <Modal
        description={projectModal.mode === "create" ? "Registra un nuevo espacio de trabajo." : "Ajusta el proyecto existente."}
        onClose={() => setProjectModal({ open: false, mode: "create" })}
        open={projectModal.open}
        title={projectModal.mode === "create" ? "Nuevo proyecto" : "Editar proyecto"}
      >
        <form className="space-y-4" onSubmit={submitProject}>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Titulo</span>
            <input className="input" onChange={(e) => setProjectForm((c) => ({ ...c, title: e.target.value }))} value={projectForm.title} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Descripcion</span>
            <textarea
              className="input min-h-32 resize-none"
              onChange={(e) => setProjectForm((c) => ({ ...c, description: e.target.value }))}
              value={projectForm.description}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-text">Materia vinculada</span>
              <select
                className="input"
                onChange={(event) => setProjectForm((current) => ({ ...current, subjectId: event.target.value }))}
                value={projectForm.subjectId}
              >
                <option value="">Sin materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-text">Fecha limite</span>
              <input
                className="input"
                onChange={(e) => setProjectForm((c) => ({ ...c, dueDate: e.target.value }))}
                type="datetime-local"
                value={projectForm.dueDate}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Color</span>
            <input className="input h-12 p-2" onChange={(e) => setProjectForm((c) => ({ ...c, color: e.target.value }))} type="color" value={projectForm.color} />
          </label>
          {!subjects.length ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted">
              Todavia no registras materias. Puedes hacerlo desde tu perfil academico.
            </div>
          ) : null}
          <div className="flex flex-wrap justify-between gap-3 pt-2">
            {projectModal.mode === "edit" ? (
              <button className="btn-ghost text-danger hover:bg-danger/10 hover:text-danger" onClick={removeProject} type="button">
                Eliminar proyecto
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setProjectModal({ open: false, mode: "create" })} type="button">
                Cancelar
              </button>
              <button className="btn-primary" type="submit">
                Guardar proyecto
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        description={taskModal.mode === "create" ? "Agrega una nueva tarea al proyecto." : "Modifica estado, prioridad, etiquetas y subtareas."}
        onClose={() => setTaskModal({ open: false, mode: "create", task: null })}
        open={taskModal.open}
        title={taskModal.mode === "create" ? "Nueva tarea" : "Editar tarea"}
      >
        <form className="space-y-4" onSubmit={submitTask}>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Titulo</span>
            <input className="input" onChange={(e) => setTaskForm((c) => ({ ...c, title: e.target.value }))} value={taskForm.title} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Descripcion</span>
            <textarea
              className="input min-h-28 resize-none"
              onChange={(e) => setTaskForm((c) => ({ ...c, description: e.target.value }))}
              value={taskForm.description}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="Prioridad"
              onChange={(value) => setTaskForm((c) => ({ ...c, priority: value }))}
              options={priorityOptions}
              value={taskForm.priority}
            />
            <SelectField
              label="Estado"
              onChange={(value) => setTaskForm((c) => ({ ...c, status: value }))}
              options={statuses}
              value={taskForm.status}
            />
            <label className="block">
              <span className="mb-2 block text-sm text-text">Deadline</span>
              <input
                className="input"
                onChange={(e) => setTaskForm((c) => ({ ...c, dueDate: e.target.value }))}
                type="datetime-local"
                value={taskForm.dueDate}
              />
            </label>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm text-text">Etiquetas</span>
              <button className="btn-ghost px-3 py-2 text-xs" onClick={openTagModal} type="button">
                Crear etiqueta
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {(tagsQuery.data ?? []).length ? (
                (tagsQuery.data ?? []).map((tag) => {
                  const active = taskForm.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        active ? "border-transparent text-white" : "border-border text-muted"
                      }`}
                      onClick={(event) => {
                        event.preventDefault();
                        setTaskForm((current) => ({
                          ...current,
                          tagIds: active
                            ? current.tagIds.filter((tagId) => tagId !== tag.id)
                            : [...current.tagIds, tag.id],
                        }));
                      }}
                      style={{
                        backgroundColor: active ? tag.color : "rgba(15, 23, 42, 0.55)",
                      }}
                      type="button"
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted">
                  No hay etiquetas creadas todavia.
                </div>
              )}
            </div>
          </div>

          {taskModal.mode === "edit" ? (
            <div className="rounded-3xl border border-border bg-slate-900/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text">Subtareas</p>
                <span className="pill">
                  {taskModal.task?.subtasks?.filter((subtask) => subtask.completed).length ?? 0}/
                  {taskModal.task?.subtasks?.length ?? 0} completadas
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  className="input flex-1"
                  onChange={(event) => setSubtaskDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      createSubtask();
                    }
                  }}
                  placeholder="Nueva subtarea..."
                  value={subtaskDraft}
                />
                <button
                  className="btn-primary sm:min-w-[140px]"
                  disabled={subtaskPendingId === "create" || !subtaskDraft.trim()}
                  onClick={createSubtask}
                  type="button"
                >
                  {subtaskPendingId === "create" ? "Guardando..." : "Agregar"}
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {taskModal.task?.subtasks?.length ? (
                  taskModal.task.subtasks.map((subtask) => {
                    const isBusy = subtaskPendingId === subtask.id;

                    return (
                      <div
                        key={subtask.id}
                        className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <button
                          className="flex items-center gap-3 text-left"
                          disabled={isBusy}
                          onClick={() => toggleSubtask(subtask)}
                          type="button"
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${
                              subtask.completed
                                ? "border-success bg-success/20 text-success"
                                : "border-border bg-slate-900/70 text-muted"
                            }`}
                          >
                            {subtask.completed ? "v" : ""}
                          </span>
                          <span className={`text-sm ${subtask.completed ? "text-muted line-through" : "text-text"}`}>
                            {subtask.title}
                          </span>
                        </button>

                        <div className="flex items-center gap-2">
                          <StatusBadge value={subtask.completed ? "DONE" : "TODO"} />
                          <button
                            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted transition hover:border-danger/30 hover:text-danger"
                            disabled={isBusy}
                            onClick={() => removeSubtask(subtask.id)}
                            type="button"
                          >
                            {isBusy ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted">
                    Esta tarea todavia no tiene subtareas.
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            {taskModal.mode === "edit" ? (
              <button className="btn-ghost text-danger hover:bg-danger/10 hover:text-danger" onClick={removeTask} type="button">
                Eliminar tarea
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setTaskModal({ open: false, mode: "create", task: null })} type="button">
                Cancelar
              </button>
              <button className="btn-primary" type="submit">
                Guardar tarea
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        description="Crea etiquetas reutilizables para clasificar prioridades, materias o tipos de entregable."
        onClose={() => setTagModalOpen(false)}
        open={tagModalOpen}
        title="Nueva etiqueta"
      >
        <form className="space-y-4" onSubmit={submitTag}>
          <label className="block">
            <span className="mb-2 block text-sm text-text">Nombre</span>
            <input
              className="input"
              onChange={(event) => setTagForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ejemplo: Examenes"
              value={tagForm.name}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-text">Color</span>
            <input
              className="input h-12 p-2"
              onChange={(event) => setTagForm((current) => ({ ...current, color: event.target.value }))}
              type="color"
              value={tagForm.color}
            />
          </label>

          <div className="rounded-2xl border border-border bg-slate-900/55 p-4">
            <p className="mb-3 text-sm text-muted">Vista previa</p>
            <span
              className="rounded-full px-3 py-2 text-xs font-semibold"
              style={{ backgroundColor: `${tagForm.color}20`, color: tagForm.color }}
            >
              {tagForm.name || "Nueva etiqueta"}
            </span>
          </div>

          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setTagModalOpen(false)} type="button">
              Cancelar
            </button>
            <button className="btn-primary" disabled={tagForm.name.trim().length < 2} type="submit">
              Guardar etiqueta
            </button>
          </div>
        </form>
      </Modal>
    </PageShell>
  );
}

function KanbanColumn({ columnId, dragEnabled, tasks, title, onTaskClick }) {
  const { isOver, setNodeRef } = useDroppable({
    id: columnId,
  });

  return (
    <div className="panel min-h-[420px] p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-text">{title}</h4>
        <span className="pill">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`mt-4 min-h-[320px] space-y-3 rounded-[28px] transition ${
            isOver ? "bg-primary/5 ring-1 ring-primary/30" : ""
          }`}
        >
          {tasks.length ? (
            tasks.map((task) =>
              dragEnabled ? (
                <SortableTaskCard key={task.id} onClick={() => onTaskClick(task)} task={task} />
              ) : (
                <TaskCard key={task.id} onClick={() => onTaskClick(task)} task={task} />
              )
            )
          ) : (
            <div className="rounded-3xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
              No hay tareas visibles en esta columna.
            </div>
          )}
          <div className="h-3 rounded-2xl border border-dashed border-border/50" />
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
    >
      <TaskCard task={task} onClick={onClick} attributes={attributes} listeners={listeners} />
    </div>
  );
}

function TaskCard({ task, onClick, attributes = {}, listeners = {} }) {
  return (
    <button
      className="w-full rounded-3xl border border-border bg-slate-900/65 p-4 text-left transition hover:border-primary/30"
      onClick={onClick}
      type="button"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-text">{task.title}</p>
        <StatusBadge value={task.priority} />
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">{task.description || "Sin descripcion detallada."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge value={task.status} />
        {task.taskTags.slice(0, 2).map((entry) => (
          <span
            key={entry.tag.id}
            className="rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: `${entry.tag.color}20`, color: entry.tag.color }}
          >
            {entry.tag.name}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
        <span>{formatDate(task.dueDate, { withYear: true })}</span>
        <span>
          {task.subtasks.filter((subtask) => subtask.completed).length}/{task.subtasks.length} subtareas
        </span>
      </div>
    </button>
  );
}

function InsightCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-border bg-slate-900/60 p-4">
      <p className="text-sm text-muted">{label}</p>
      <strong className="mt-3 block text-3xl font-semibold text-text">{value}</strong>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-text">{label}</span>
      <select className="input" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "ALL" ? "Todos" : option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoStack({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-slate-950/65 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-text">{value}</p>
    </div>
  );
}
