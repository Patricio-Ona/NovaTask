import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";
import { logActivity } from "./activity.service.js";

export const getTemplates = async () =>
  prisma.template.findMany({
    include: {
      templateTasks: {
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

export const applyTemplate = async (userId, templateId, payload) => {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: { templateTasks: true },
  });

  if (!template) {
    throw new AppError("Plantilla no encontrada", 404);
  }

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        userId,
        title: payload.projectTitle,
        description: payload.description || template.description,
        color: template.color,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      },
    });

    if (template.templateTasks.length) {
      await tx.task.createMany({
        data: template.templateTasks.map((task) => ({
          projectId: createdProject.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          position: task.position,
        })),
      });
    }

    return createdProject;
  });

  await logActivity({
    userId,
    action: "TEMPLATE_APPLIED",
    entityType: "TEMPLATE",
    entityId: template.id,
  });

  return project;
};
