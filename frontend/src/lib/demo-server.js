const DEMO_STATE_KEY = "novatask-demo-db";
const DEMO_MODE_KEY = "novatask-demo-mode";
const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const TASK_STATUS_ORDER = Object.fromEntries(TASK_STATUSES.map((value, index) => [value, index]));

const isoNow = () => new Date().toISOString();

const addDays = (date, amount) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
};

const setHour = (date, hour) => {
  const copy = new Date(date);
  copy.setHours(hour, 0, 0, 0);
  return copy;
};

const createId = (prefix) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createError = (message, status = 400, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
};

const readBody = (body) => {
  if (!body) return {};
  if (typeof body === "string") {
    return JSON.parse(body);
  }
  return body;
};

const normalizeEmail = (value) => value.trim().toLowerCase();

const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl,
});

const buildSessionPayload = (user) => ({
  accessToken: `demo-access:${user.id}:${Date.now()}`,
  refreshToken: `demo-refresh:${user.id}:${Date.now()}`,
  user: serializeUser(user),
  mode: "demo",
});

const extractUserIdFromToken = (token, prefix) => {
  if (!token?.startsWith(prefix)) return null;
  const [, userId] = token.split(":");
  return userId || null;
};

const isWindowAvailable = () => typeof window !== "undefined" && Boolean(window.localStorage);

const saveState = (state) => {
  if (!isWindowAvailable()) return;
  window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
};

const getDefaultState = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const userId = createId("user");
  const thesisProjectId = createId("project");
  const architectureProjectId = createId("project");
  const urgentTagId = createId("tag");
  const researchTagId = createId("tag");
  const uiTagId = createId("tag");
  const examTemplateId = createId("template");
  const sprintTemplateId = createId("template");

  const tasks = [
    {
      id: createId("task"),
      projectId: thesisProjectId,
      title: "Disenar dashboard principal",
      description: "Resumen semanal, deadlines y metricas operativas del sistema.",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: setHour(addDays(now, 2), 20).toISOString(),
      position: 0,
      createdAt: addDays(now, -10).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: createId("task"),
      projectId: thesisProjectId,
      title: "Implementar autenticacion propia",
      description: "Registro, login, refresh y proteccion de rutas para el MVP.",
      priority: "HIGH",
      status: "TODO",
      dueDate: setHour(addDays(now, 4), 19).toISOString(),
      position: 0,
      createdAt: addDays(now, -8).toISOString(),
      updatedAt: addDays(now, -8).toISOString(),
    },
    {
      id: createId("task"),
      projectId: thesisProjectId,
      title: "Preparar primer avance de tesis",
      description: "Documento con objetivos, prototipo, arquitectura y flujo del MVP.",
      priority: "MEDIUM",
      status: "DONE",
      dueDate: setHour(addDays(now, -2), 18).toISOString(),
      position: 0,
      createdAt: addDays(now, -14).toISOString(),
      updatedAt: addDays(now, -2).toISOString(),
    },
    {
      id: createId("task"),
      projectId: architectureProjectId,
      title: "Ajustar tablero Kanban",
      description: "Pulir drag and drop y subtareas para la demo funcional.",
      priority: "MEDIUM",
      status: "REVIEW",
      dueDate: setHour(addDays(now, 1), 17).toISOString(),
      position: 0,
      createdAt: addDays(now, -6).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: createId("task"),
      projectId: architectureProjectId,
      title: "Documentar API REST",
      description: "Actualizar rutas, payloads y decisiones tecnicas del backend.",
      priority: "LOW",
      status: "TODO",
      dueDate: setHour(addDays(now, 6), 16).toISOString(),
      position: 1,
      createdAt: addDays(now, -5).toISOString(),
      updatedAt: addDays(now, -5).toISOString(),
    },
  ];

  const [dashboardTask, authTask, thesisDoneTask, reviewTask] = tasks;

  return {
    users: [
      {
        id: userId,
        name: "Patricio Ona",
        email: "patricio@novatask.dev",
        password: "Patricio123*",
        avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent("Patricio Ona")}`,
        createdAt: addDays(now, -20).toISOString(),
        updatedAt: addDays(now, -1).toISOString(),
      },
    ],
    projects: [
      {
        id: thesisProjectId,
        userId,
        title: "Trabajo de Titulacion",
        description: "Proyecto principal de la tesis NovaTask con enfoque en productividad academica.",
        color: "#6366F1",
        dueDate: setHour(addDays(now, 25), 20).toISOString(),
        createdAt: addDays(now, -20).toISOString(),
        updatedAt: addDays(now, -1).toISOString(),
      },
      {
        id: architectureProjectId,
        userId,
        title: "Arquitectura de Software",
        description: "Entregables, revisiones y seguimiento del modulo tecnico.",
        color: "#8B5CF6",
        dueDate: setHour(addDays(now, 12), 18).toISOString(),
        createdAt: addDays(now, -12).toISOString(),
        updatedAt: addDays(now, -1).toISOString(),
      },
    ],
    tasks,
    subtasks: [
      { id: createId("subtask"), taskId: dashboardTask.id, title: "Topbar y metricas", completed: true, createdAt: addDays(now, -9).toISOString() },
      { id: createId("subtask"), taskId: dashboardTask.id, title: "Cards de deadlines", completed: true, createdAt: addDays(now, -8).toISOString() },
      { id: createId("subtask"), taskId: dashboardTask.id, title: "Actividad reciente", completed: false, createdAt: addDays(now, -7).toISOString() },
      { id: createId("subtask"), taskId: authTask.id, title: "Pantalla de login", completed: true, createdAt: addDays(now, -7).toISOString() },
      { id: createId("subtask"), taskId: authTask.id, title: "Tokens y sesion", completed: false, createdAt: addDays(now, -6).toISOString() },
      { id: createId("subtask"), taskId: reviewTask.id, title: "Mover entre columnas", completed: true, createdAt: addDays(now, -4).toISOString() },
      { id: createId("subtask"), taskId: thesisDoneTask.id, title: "Version Word", completed: true, createdAt: addDays(now, -13).toISOString() },
    ],
    tags: [
      { id: urgentTagId, name: "Urgente", color: "#EF4444" },
      { id: researchTagId, name: "Investigacion", color: "#8B5CF6" },
      { id: uiTagId, name: "UI/UX", color: "#6366F1" },
    ],
    taskTags: [
      { taskId: dashboardTask.id, tagId: uiTagId },
      { taskId: authTask.id, tagId: urgentTagId },
      { taskId: thesisDoneTask.id, tagId: researchTagId },
      { taskId: reviewTask.id, tagId: uiTagId },
    ],
    activityLogs: [
      { id: createId("log"), userId, action: "PROJECT_CREATED", entityType: "PROJECT", entityId: thesisProjectId, createdAt: addDays(now, -20).toISOString() },
      { id: createId("log"), userId, action: "TASK_MOVED", entityType: "TASK", entityId: dashboardTask.id, createdAt: addDays(now, -1).toISOString() },
      { id: createId("log"), userId, action: "DOCUMENT_READY", entityType: "TASK", entityId: thesisDoneTask.id, createdAt: addDays(now, -2).toISOString() },
    ],
    templates: [
      {
        id: examTemplateId,
        name: "Semana de examenes",
        description: "Bloques de estudio, checklist diario y control de fechas criticas.",
        color: "#6366F1",
        createdAt: addDays(now, -15).toISOString(),
      },
      {
        id: sprintTemplateId,
        name: "Sprint de tesis",
        description: "Mini plan de avance para redaccion, UI, backend y validacion.",
        color: "#8B5CF6",
        createdAt: addDays(now, -10).toISOString(),
      },
    ],
    templateTasks: [
      {
        id: createId("template-task"),
        templateId: examTemplateId,
        title: "Registrar fechas de examen",
        description: "Cargar evaluaciones y entregables del periodo.",
        priority: "HIGH",
        status: "TODO",
        position: 0,
        createdAt: addDays(now, -15).toISOString(),
      },
      {
        id: createId("template-task"),
        templateId: examTemplateId,
        title: "Bloques de estudio por materia",
        description: "Separar sesiones de repaso segun prioridad.",
        priority: "MEDIUM",
        status: "TODO",
        position: 1,
        createdAt: addDays(now, -15).toISOString(),
      },
      {
        id: createId("template-task"),
        templateId: sprintTemplateId,
        title: "Redaccion de avance",
        description: "Actualizar documento y hallazgos del proyecto.",
        priority: "HIGH",
        status: "TODO",
        position: 0,
        createdAt: addDays(now, -10).toISOString(),
      },
      {
        id: createId("template-task"),
        templateId: sprintTemplateId,
        title: "Validar frontend",
        description: "Revisar rutas, formularios y modales del MVP.",
        priority: "MEDIUM",
        status: "TODO",
        position: 1,
        createdAt: addDays(now, -10).toISOString(),
      },
    ],
    meta: {
      currentYear,
    },
  };
};

const loadState = () => {
  if (!isWindowAvailable()) {
    return getDefaultState();
  }

  const raw = window.localStorage.getItem(DEMO_STATE_KEY);
  if (!raw) {
    const initial = getDefaultState();
    saveState(initial);
    return initial;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const initial = getDefaultState();
    saveState(initial);
    return initial;
  }
};

const enableDemoModeStorage = () => {
  if (!isWindowAvailable()) return;
  window.localStorage.setItem(DEMO_MODE_KEY, "true");
};

const hydrateTask = (state, task) => ({
  ...task,
  subtasks: state.subtasks.filter((subtask) => subtask.taskId === task.id),
  taskTags: state.taskTags
    .filter((entry) => entry.taskId === task.id)
    .map((entry) => ({
      ...entry,
      tag: state.tags.find((tag) => tag.id === entry.tagId) ?? null,
    })),
});

const ensureProjectOwnership = (state, userId, projectId) => {
  const project = state.projects.find((item) => item.id === projectId && item.userId === userId);
  if (!project) {
    throw createError("Project not found", 404);
  }
  return project;
};

const ensureTaskOwnership = (state, userId, taskId) => {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    throw createError("Task not found", 404);
  }

  ensureProjectOwnership(state, userId, task.projectId);
  return task;
};

const appendActivity = (state, userId, action, entityType, entityId) => {
  state.activityLogs.unshift({
    id: createId("log"),
    userId,
    action,
    entityType,
    entityId,
    createdAt: isoNow(),
  });
  state.activityLogs = state.activityLogs.slice(0, 40);
};

const reorderTask = (state, taskId, nextStatus, nextPosition) => {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    throw createError("Task not found", 404);
  }

  const projectTasks = state.tasks.filter((item) => item.projectId === task.projectId);
  const columns = Object.fromEntries(
    TASK_STATUSES.map((status) => [
      status,
      projectTasks
        .filter((item) => item.status === status && item.id !== taskId)
        .sort((left, right) => left.position - right.position),
    ])
  );

  const destination = columns[nextStatus] ?? [];
  const position = Math.max(0, Math.min(nextPosition, destination.length));
  destination.splice(position, 0, task);

  TASK_STATUSES.forEach((status) => {
    columns[status].forEach((item, index) => {
      item.status = status;
      item.position = index;
      item.updatedAt = isoNow();
    });
  });
};

const buildProjectMetrics = (state, projectId) => {
  const tasks = state.tasks.filter((task) => task.projectId === projectId);
  const completed = tasks.filter((task) => task.status === "DONE").length;

  return {
    totalTasks: tasks.length,
    completedTasks: completed,
    pendingTasks: tasks.length - completed,
  };
};

const buildProjectDetail = (state, project) => ({
  ...project,
  tasks: state.tasks
    .filter((task) => task.projectId === project.id)
    .map((task) => hydrateTask(state, task))
    .sort(
      (left, right) =>
        TASK_STATUS_ORDER[left.status] - TASK_STATUS_ORDER[right.status] || left.position - right.position
    ),
});

const getAuthorizedUser = (state, context) => {
  const authorization =
    context.options?.headers?.Authorization ??
    (context.session?.accessToken ? `Bearer ${context.session.accessToken}` : null);
  const token = authorization?.startsWith("Bearer ") ? authorization.replace("Bearer ", "") : null;
  const userId = extractUserIdFromToken(token, "demo-access");
  const user = state.users.find((item) => item.id === userId);

  if (!user) {
    throw createError("Unauthorized", 401);
  }

  return user;
};

const startOfWeek = (date = new Date()) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const buildDashboardOverview = (state, userId) => {
  const projects = state.projects.filter((project) => project.userId === userId);
  const tasks = state.tasks
    .filter((task) => projects.some((project) => project.id === task.projectId))
    .map((task) => ({
      ...task,
      project: projects.find((project) => project.id === task.projectId),
    }))
    .sort((left, right) => new Date(left.dueDate ?? 0) - new Date(right.dueDate ?? 0));

  const activities = state.activityLogs.filter((item) => item.userId === userId).slice(0, 6);
  const weekStart = startOfWeek();
  const completedThisWeek = tasks.filter(
    (task) => task.status === "DONE" && new Date(task.updatedAt) >= weekStart
  ).length;
  const overdueCount = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
  ).length;
  const dueSoon = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) >= new Date() && task.status !== "DONE"
  ).slice(0, 5);
  const completionRate = tasks.length
    ? Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100)
    : 0;

  return {
    metrics: {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedThisWeek,
      overdueCount,
      completionRate,
    },
    dueSoon,
    projectSummaries: projects.map((project) => ({
      ...project,
      tasks: state.tasks.filter((task) => task.projectId === project.id).length,
      completed: state.tasks.filter((task) => task.projectId === project.id && task.status === "DONE").length,
    })),
    activity: activities,
  };
};

const buildAnalyticsOverview = (state, userId) => {
  const projects = state.projects.filter((project) => project.userId === userId);
  const tasks = state.tasks
    .filter((task) => projects.some((project) => project.id === task.projectId))
    .map((task) => ({
      ...task,
      project: projects.find((project) => project.id === task.projectId),
    }));

  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "DONE").length;
  const overdue = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
  ).length;
  const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const review = tasks.filter((task) => task.status === "REVIEW").length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;

  const byProject = projects.map((project) => ({
    name: project.title,
    value: tasks.filter((task) => task.projectId === project.id).length,
  }));

  const weeklyProgress = [...Array(6)].map((_, index) => {
    const start = startOfWeek(addDays(new Date(), -7 * (5 - index)));
    const end = addDays(start, 7);

    return {
      label: `Semana ${index + 1}`,
      created: tasks.filter((task) => new Date(task.createdAt) >= start && new Date(task.createdAt) < end).length,
      completed: tasks.filter(
        (task) => task.status === "DONE" && new Date(task.updatedAt) >= start && new Date(task.updatedAt) < end
      ).length,
    };
  });

  return {
    summary: {
      totalTasks: total,
      completionRate,
      overdue,
      inProgress,
      review,
    },
    byProject,
    weeklyProgress,
  };
};

const buildCalendarOverview = (state, userId) => {
  const projects = state.projects.filter((project) => project.userId === userId);
  return state.tasks
    .filter((task) => task.dueDate && projects.some((project) => project.id === task.projectId))
    .map((task) => {
      const project = projects.find((item) => item.id === task.projectId);
      const subtasks = state.subtasks.filter((subtask) => subtask.taskId === task.id);

      return {
        id: task.id,
        title: task.title,
        projectTitle: project?.title ?? "Proyecto",
        projectColor: project?.color ?? "#6366F1",
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority,
        completedSubtasks: subtasks.filter((subtask) => subtask.completed).length,
        totalSubtasks: subtasks.length,
      };
    })
    .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate));
};

const getTemplateCollection = (state) =>
  state.templates
    .map((template) => ({
      ...template,
      templateTasks: state.templateTasks
        .filter((task) => task.templateId === template.id)
        .sort((left, right) => left.position - right.position),
    }))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

const routeDemoRequest = (state, path, options, context) => {
  const method = (options.method ?? "GET").toUpperCase();
  const body = readBody(options.body);

  if (path === "/auth/login" && method === "POST") {
    const email = normalizeEmail(body.email ?? "");
    const user = state.users.find((item) => item.email === email && item.password === body.password);
    if (!user) {
      throw createError("Invalid credentials", 401);
    }
    appendActivity(state, user.id, "USER_LOGGED_IN", "AUTH", user.id);
    return buildSessionPayload(user);
  }

  if (path === "/auth/register" && method === "POST") {
    const email = normalizeEmail(body.email ?? "");
    if (state.users.some((item) => item.email === email)) {
      throw createError("Email already in use", 409);
    }

    const user = {
      id: createId("user"),
      name: body.name?.trim() || "Usuario NovaTask",
      email,
      password: body.password,
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(body.name?.trim() || email)}`,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };

    state.users.unshift(user);
    appendActivity(state, user.id, "USER_REGISTERED", "AUTH", user.id);
    return buildSessionPayload(user);
  }

  if (path === "/auth/refresh" && method === "POST") {
    const userId = extractUserIdFromToken(body.refreshToken, "demo-refresh");
    const user = state.users.find((item) => item.id === userId);
    if (!user) {
      throw createError("Refresh token is invalid", 401);
    }
    return {
      accessToken: `demo-access:${user.id}:${Date.now()}`,
      user: serializeUser(user),
      mode: "demo",
    };
  }

  if (path === "/auth/logout" && method === "POST") {
    return { success: true };
  }

  const user = getAuthorizedUser(state, context);

  if (path === "/auth/me" && method === "GET") {
    return serializeUser(user);
  }

  if (path === "/dashboard/overview" && method === "GET") {
    return buildDashboardOverview(state, user.id);
  }

  if (path === "/analytics/overview" && method === "GET") {
    return buildAnalyticsOverview(state, user.id);
  }

  if (path === "/calendar" && method === "GET") {
    return buildCalendarOverview(state, user.id);
  }

  if (path === "/tags" && method === "GET") {
    return state.tags;
  }

  if (path === "/tags" && method === "POST") {
    const tag = {
      id: createId("tag"),
      name: body.name?.trim(),
      color: body.color || "#8B5CF6",
    };
    state.tags.push(tag);
    return tag;
  }

  if (path === "/projects" && method === "GET") {
    return state.projects
      .filter((project) => project.userId === user.id)
      .map((project) => ({
        ...project,
        metrics: buildProjectMetrics(state, project.id),
      }))
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  }

  if (path === "/projects" && method === "POST") {
    const project = {
      id: createId("project"),
      userId: user.id,
      title: body.title?.trim(),
      description: body.description || null,
      color: body.color || "#6366F1",
      dueDate: body.dueDate || null,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    state.projects.unshift(project);
    appendActivity(state, user.id, "PROJECT_CREATED", "PROJECT", project.id);
    return project;
  }

  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectMatch && method === "GET") {
    const project = ensureProjectOwnership(state, user.id, projectMatch[1]);
    return buildProjectDetail(state, project);
  }

  if (projectMatch && method === "PATCH") {
    const project = ensureProjectOwnership(state, user.id, projectMatch[1]);
    project.title = body.title ?? project.title;
    project.description = body.description ?? project.description;
    project.color = body.color ?? project.color;
    project.dueDate = body.dueDate === null ? null : body.dueDate ?? project.dueDate;
    project.updatedAt = isoNow();
    appendActivity(state, user.id, "PROJECT_UPDATED", "PROJECT", project.id);
    return project;
  }

  if (projectMatch && method === "DELETE") {
    const project = ensureProjectOwnership(state, user.id, projectMatch[1]);
    const projectTaskIds = state.tasks.filter((task) => task.projectId === project.id).map((task) => task.id);
    state.projects = state.projects.filter((item) => item.id !== project.id);
    state.tasks = state.tasks.filter((task) => task.projectId !== project.id);
    state.subtasks = state.subtasks.filter((subtask) => !projectTaskIds.includes(subtask.taskId));
    state.taskTags = state.taskTags.filter((entry) => !projectTaskIds.includes(entry.taskId));
    appendActivity(state, user.id, "PROJECT_DELETED", "PROJECT", project.id);
    return { success: true };
  }

  if (path === "/tasks" && method === "POST") {
    ensureProjectOwnership(state, user.id, body.projectId);
    const position =
      body.position ??
      state.tasks.filter((task) => task.projectId === body.projectId && task.status === (body.status ?? "TODO")).length;
    const task = {
      id: createId("task"),
      projectId: body.projectId,
      title: body.title?.trim(),
      description: body.description || null,
      priority: body.priority || "MEDIUM",
      status: body.status || "TODO",
      dueDate: body.dueDate || null,
      position,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    state.tasks.push(task);
    state.taskTags = state.taskTags.concat((body.tagIds ?? []).map((tagId) => ({ taskId: task.id, tagId })));
    appendActivity(state, user.id, "TASK_CREATED", "TASK", task.id);
    return hydrateTask(state, task);
  }

  const taskMoveMatch = path.match(/^\/tasks\/([^/]+)\/move$/);
  if (taskMoveMatch && method === "PATCH") {
    ensureTaskOwnership(state, user.id, taskMoveMatch[1]);
    reorderTask(state, taskMoveMatch[1], body.status, body.position ?? 0);
    appendActivity(state, user.id, "TASK_MOVED", "TASK", taskMoveMatch[1]);
    return hydrateTask(state, state.tasks.find((task) => task.id === taskMoveMatch[1]));
  }

  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch && method === "PATCH") {
    const task = ensureTaskOwnership(state, user.id, taskMatch[1]);
    task.title = body.title ?? task.title;
    task.description = body.description === undefined ? task.description : body.description;
    task.priority = body.priority ?? task.priority;
    task.dueDate = body.dueDate === null ? null : body.dueDate ?? task.dueDate;
    task.updatedAt = isoNow();

    if (Array.isArray(body.tagIds)) {
      state.taskTags = state.taskTags.filter((entry) => entry.taskId !== task.id);
      state.taskTags = state.taskTags.concat(body.tagIds.map((tagId) => ({ taskId: task.id, tagId })));
    }

    if (body.status || body.position !== undefined) {
      reorderTask(state, task.id, body.status ?? task.status, body.position ?? task.position);
    }

    appendActivity(state, user.id, "TASK_UPDATED", "TASK", task.id);
    return hydrateTask(state, task);
  }

  if (taskMatch && method === "DELETE") {
    ensureTaskOwnership(state, user.id, taskMatch[1]);
    state.tasks = state.tasks.filter((task) => task.id !== taskMatch[1]);
    state.subtasks = state.subtasks.filter((subtask) => subtask.taskId !== taskMatch[1]);
    state.taskTags = state.taskTags.filter((entry) => entry.taskId !== taskMatch[1]);
    appendActivity(state, user.id, "TASK_DELETED", "TASK", taskMatch[1]);
    return { success: true };
  }

  const subtaskCreateMatch = path.match(/^\/tasks\/([^/]+)\/subtasks$/);
  if (subtaskCreateMatch && method === "POST") {
    ensureTaskOwnership(state, user.id, subtaskCreateMatch[1]);
    const subtask = {
      id: createId("subtask"),
      taskId: subtaskCreateMatch[1],
      title: body.title?.trim(),
      completed: false,
      createdAt: isoNow(),
    };
    state.subtasks.push(subtask);
    appendActivity(state, user.id, "SUBTASK_CREATED", "SUBTASK", subtask.id);
    return subtask;
  }

  const subtaskMatch = path.match(/^\/tasks\/subtasks\/([^/]+)$/);
  if (subtaskMatch && method === "PATCH") {
    const subtask = state.subtasks.find((item) => item.id === subtaskMatch[1]);
    if (!subtask) {
      throw createError("Subtask not found", 404);
    }
    ensureTaskOwnership(state, user.id, subtask.taskId);
    subtask.title = body.title ?? subtask.title;
    subtask.completed = body.completed ?? subtask.completed;
    appendActivity(state, user.id, "SUBTASK_UPDATED", "SUBTASK", subtask.id);
    return subtask;
  }

  if (subtaskMatch && method === "DELETE") {
    const subtask = state.subtasks.find((item) => item.id === subtaskMatch[1]);
    if (!subtask) {
      throw createError("Subtask not found", 404);
    }
    ensureTaskOwnership(state, user.id, subtask.taskId);
    state.subtasks = state.subtasks.filter((item) => item.id !== subtask.id);
    appendActivity(state, user.id, "SUBTASK_DELETED", "SUBTASK", subtask.id);
    return { success: true };
  }

  if (path === "/templates" && method === "GET") {
    return getTemplateCollection(state);
  }

  const templateApplyMatch = path.match(/^\/templates\/([^/]+)\/apply$/);
  if (templateApplyMatch && method === "POST") {
    const template = state.templates.find((item) => item.id === templateApplyMatch[1]);
    if (!template) {
      throw createError("Template not found", 404);
    }

    const project = {
      id: createId("project"),
      userId: user.id,
      title: body.projectTitle?.trim() || template.name,
      description: body.description || template.description,
      color: template.color,
      dueDate: body.dueDate || null,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };

    state.projects.unshift(project);

    state.templateTasks
      .filter((task) => task.templateId === template.id)
      .sort((left, right) => left.position - right.position)
      .forEach((templateTask) => {
        state.tasks.push({
          id: createId("task"),
          projectId: project.id,
          title: templateTask.title,
          description: templateTask.description,
          priority: templateTask.priority,
          status: templateTask.status,
          dueDate: null,
          position: templateTask.position,
          createdAt: isoNow(),
          updatedAt: isoNow(),
        });
      });

    appendActivity(state, user.id, "TEMPLATE_APPLIED", "TEMPLATE", template.id);
    return project;
  }

  throw createError("Route not found", 404);
};

export const isDemoModeEnabled = () => (isWindowAvailable() ? window.localStorage.getItem(DEMO_MODE_KEY) === "true" : false);

export const enableDemoMode = () => {
  enableDemoModeStorage();
};

export const handleDemoRequest = async (path, options = {}, context = {}) => {
  const state = loadState();

  try {
    const data = routeDemoRequest(state, path, options, context);
    saveState(state);
    return data;
  } catch (error) {
    throw error.status ? error : createError(error.message || "Demo request failed", 500);
  }
};
