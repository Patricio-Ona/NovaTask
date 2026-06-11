import { TaskStatus } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";
import { logActivity } from "./activity.service.js";

const ensureProjectOwnership = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new AppError("Proyecto no encontrado", 404);
  }

  return project;
};

const ensureSubjectOwnership = async (subjectId, userId) => {
  if (!subjectId) {
    return null;
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });

  if (!subject) {
    throw new AppError("La materia seleccionada no existe", 404);
  }

  return subject;
};

const mapProjectMetrics = (project) => {
  const completed = project.tasks.filter((task) => task.status === TaskStatus.DONE).length;

  return {
    ...project,
    metrics: {
      totalTasks: project.tasks.length,
      completedTasks: completed,
      pendingTasks: project.tasks.length - completed,
    },
  };
};

export const getProjects = async (userId) => {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
        },
      },
      tasks: {
        select: {
          id: true,
          status: true,
          dueDate: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects.map(mapProjectMetrics);
};

export const getProjectById = async (projectId, userId) => {
  await ensureProjectOwnership(projectId, userId);

  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          instructor: true,
          color: true,
          academicTerm: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      tasks: {
        include: {
          subtasks: true,
          taskTags: {
            include: { tag: true },
          },
        },
        orderBy: [{ status: "asc" }, { position: "asc" }],
      },
    },
  });
};

export const createProject = async (userId, payload) => {
  await ensureSubjectOwnership(payload.subjectId, userId);

  const project = await prisma.project.create({
    data: {
      userId,
      subjectId: payload.subjectId || null,
      title: payload.title,
      description: payload.description || null,
      color: payload.color || "#6366F1",
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
        },
      },
    },
  });

  await logActivity({
    userId,
    action: "PROJECT_CREATED",
    entityType: "PROJECT",
    entityId: project.id,
  });

  return project;
};

export const updateProject = async (projectId, userId, payload) => {
  await ensureProjectOwnership(projectId, userId);
  await ensureSubjectOwnership(payload.subjectId, userId);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: payload.title,
      description: payload.description,
      color: payload.color,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : payload.dueDate === null ? null : undefined,
      subjectId: payload.subjectId === undefined ? undefined : payload.subjectId || null,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
        },
      },
    },
  });

  await logActivity({
    userId,
    action: "PROJECT_UPDATED",
    entityType: "PROJECT",
    entityId: project.id,
  });

  return project;
};

export const deleteProject = async (projectId, userId) => {
  await ensureProjectOwnership(projectId, userId);
  await prisma.project.delete({ where: { id: projectId } });

  await logActivity({
    userId,
    action: "PROJECT_DELETED",
    entityType: "PROJECT",
    entityId: projectId,
  });

  return { success: true };
};
