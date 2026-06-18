import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";
import { logActivity } from "./activity.service.js";
import { sendTaskCompletedEmail } from "./email.service.js";

const boardStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const ensureTagOwnership = async (tagIds, userId) => {
  if (!tagIds?.length) {
    return;
  }

  const tags = await prisma.tag.findMany({
    where: {
      id: { in: tagIds },
      userId,
    },
    select: { id: true },
  });

  if (tags.length !== tagIds.length) {
    throw new AppError("Una o mas etiquetas no pertenecen al usuario", 400);
  }
};

const ensureTaskOwnership = async (taskId, userId) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { userId },
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          color: true,
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      taskTags: true,
      subtasks: true,
    },
  });

  if (!task) {
    throw new AppError("Tarea no encontrada", 404);
  }

  return task;
};

const buildTaskInclude = () => ({
  project: {
    select: {
      id: true,
      title: true,
      color: true,
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  subtasks: true,
  taskTags: { include: { tag: true } },
});

const notifyTaskCompletionByEmail = async ({ previousStatus, userId, task }) => {
  if (previousStatus === "DONE" || task?.status !== "DONE" || !task?.project?.user?.email) {
    return;
  }

  try {
    const result = await sendTaskCompletedEmail({
      user: task.project.user,
      task,
    });

    if (result.sent) {
      await logActivity({
        userId,
        action: "EMAIL_NOTIFICATION_SENT",
        entityType: "TASK",
        entityId: task.id,
      });
    }
  } catch (error) {
    console.error(`[mail] No se pudo enviar el correo de tarea completada para ${task.id}:`, error.message);

    await logActivity({
      userId,
      action: "EMAIL_NOTIFICATION_FAILED",
      entityType: "TASK",
      entityId: task.id,
    }).catch(() => {});
  }
};

const clampPosition = (position, max) => Math.max(0, Math.min(position, max));

const reorderBoardTask = async (tx, taskId, projectId, nextStatus, nextPosition) => {
  const boardTasks = await tx.task.findMany({
    where: { projectId },
    select: {
      id: true,
      status: true,
      position: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "asc" }],
  });

  const currentTask = boardTasks.find((task) => task.id === taskId);
  if (!currentTask) {
    throw new AppError("Tarea no encontrada", 404);
  }

  const columns = Object.fromEntries(
    boardStatuses.map((status) => [
      status,
      boardTasks
        .filter((task) => task.status === status && task.id !== taskId)
        .sort((left, right) => left.position - right.position),
    ])
  );

  const insertableTasks = columns[nextStatus] ?? [];
  const destinationPosition = clampPosition(nextPosition, insertableTasks.length);

  insertableTasks.splice(destinationPosition, 0, {
    id: taskId,
    status: nextStatus,
    position: destinationPosition,
  });

  await Promise.all(
    boardStatuses.flatMap((status) =>
      columns[status].map((task, index) =>
        tx.task.update({
          where: { id: task.id },
          data: {
            status,
            position: index,
          },
        })
      )
    )
  );

  return tx.task.findUnique({
    where: { id: taskId },
    include: buildTaskInclude(),
  });
};

export const getTasks = async (userId, filters = {}) => {
  const tasks = await prisma.task.findMany({
    where: {
      project: {
        userId,
        ...(filters.projectId ? { id: filters.projectId } : {}),
      },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: buildTaskInclude(),
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return tasks.sort((left, right) => {
    if (!left.dueDate && !right.dueDate) return 0;
    if (!left.dueDate) return 1;
    if (!right.dueDate) return -1;
    return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
  });
};

export const createTask = async (userId, payload) => {
  const project = await prisma.project.findFirst({
    where: { id: payload.projectId, userId },
  });

  if (!project) {
    throw new AppError("Proyecto no encontrado", 404);
  }

  await ensureTagOwnership(payload.tagIds, userId);

  const status = payload.status ?? "TODO";
  const fallbackPosition = await prisma.task.count({
    where: {
      projectId: payload.projectId,
      status,
    },
  });
  const inheritedDueDate = payload.dueDate ? new Date(payload.dueDate) : project.dueDate ?? null;

  const task = await prisma.task.create({
    data: {
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description || null,
      priority: payload.priority ?? "MEDIUM",
      status,
      dueDate: inheritedDueDate,
      position: payload.position ?? fallbackPosition,
      taskTags: payload.tagIds?.length
        ? {
            createMany: {
              data: payload.tagIds.map((tagId) => ({ tagId })),
            },
          }
        : undefined,
    },
    include: buildTaskInclude(),
  });

  await logActivity({
    userId,
    action: "TASK_CREATED",
    entityType: "TASK",
    entityId: task.id,
  });

  return task;
};

export const updateTask = async (taskId, userId, payload) => {
  const existingTask = await ensureTaskOwnership(taskId, userId);
  await ensureTagOwnership(payload.tagIds, userId);

  const task = await prisma.$transaction(async (tx) => {
    if (payload.tagIds) {
      await tx.taskTag.deleteMany({ where: { taskId } });
      if (payload.tagIds.length) {
        await tx.taskTag.createMany({
          data: payload.tagIds.map((tagId) => ({ taskId, tagId })),
        });
      }
    }

    await tx.task.update({
      where: { id: taskId },
      data: {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate === null ? null : undefined,
      },
    });

    const nextStatus = payload.status ?? existingTask.status;
    const shouldReorder = nextStatus !== existingTask.status || payload.position !== undefined;

    if (shouldReorder) {
      const nextPosition =
        payload.position ?? (nextStatus === existingTask.status ? existingTask.position : Number.MAX_SAFE_INTEGER);

      return reorderBoardTask(tx, taskId, existingTask.projectId, nextStatus, nextPosition);
    }

    return tx.task.findUnique({
      where: { id: taskId },
      include: buildTaskInclude(),
    });
  });

  await logActivity({
    userId,
    action: "TASK_UPDATED",
    entityType: "TASK",
    entityId: task.id,
  });

  await notifyTaskCompletionByEmail({
    previousStatus: existingTask.status,
    userId,
    task,
  });

  return task;
};

export const moveTask = async (taskId, userId, payload) => {
  const existingTask = await ensureTaskOwnership(taskId, userId);

  const task = await prisma.$transaction((tx) =>
    reorderBoardTask(tx, taskId, existingTask.projectId, payload.status, payload.position)
  );

  await logActivity({
    userId,
    action: "TASK_MOVED",
    entityType: "TASK",
    entityId: task.id,
  });

  await notifyTaskCompletionByEmail({
    previousStatus: existingTask.status,
    userId,
    task,
  });

  return task;
};

export const deleteTask = async (taskId, userId) => {
  await ensureTaskOwnership(taskId, userId);
  await prisma.task.delete({ where: { id: taskId } });

  await logActivity({
    userId,
    action: "TASK_DELETED",
    entityType: "TASK",
    entityId: taskId,
  });

  return { success: true };
};

export const createSubtask = async (taskId, userId, payload) => {
  await ensureTaskOwnership(taskId, userId);

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title: payload.title,
    },
  });

  await logActivity({
    userId,
    action: "SUBTASK_CREATED",
    entityType: "SUBTASK",
    entityId: subtask.id,
  });

  return subtask;
};

export const updateSubtask = async (subtaskId, userId, payload) => {
  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      task: {
        project: { userId },
      },
    },
  });

  if (!subtask) {
    throw new AppError("Subtarea no encontrada", 404);
  }

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      title: payload.title,
      completed: payload.completed,
    },
  });

  await logActivity({
    userId,
    action: "SUBTASK_UPDATED",
    entityType: "SUBTASK",
    entityId: updated.id,
  });

  return updated;
};

export const deleteSubtask = async (subtaskId, userId) => {
  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      task: {
        project: { userId },
      },
    },
  });

  if (!subtask) {
    throw new AppError("Subtarea no encontrada", 404);
  }

  await prisma.subtask.delete({ where: { id: subtaskId } });

  await logActivity({
    userId,
    action: "SUBTASK_DELETED",
    entityType: "SUBTASK",
    entityId: subtaskId,
  });

  return { success: true };
};
