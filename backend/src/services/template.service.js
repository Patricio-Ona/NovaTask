import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";
import { logActivity } from "./activity.service.js";
import { defaultTemplateCatalog } from "../data/default-templates.js";

const buildTemplateTaskData = (tasks = []) =>
  tasks.map((task, index) => ({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    position: index + 1,
  }));

const createTemplateFromCatalog = (client, template) =>
  client.template.create({
    data: {
      name: template.name,
      description: template.description,
      color: template.color,
      templateTasks: {
        create: buildTemplateTaskData(template.tasks),
      },
    },
  });

const ensureDefaultTemplates = async (client = prisma) => {
  const existingTemplates = await client.template.findMany({
    select: { name: true },
  });

  const existingNames = new Set(existingTemplates.map((template) => template.name));
  const missingTemplates = defaultTemplateCatalog.filter((template) => !existingNames.has(template.name));

  for (const template of missingTemplates) {
    await createTemplateFromCatalog(client, template);
  }
};

export const getTemplates = async () => {
  await ensureDefaultTemplates();

  const templates = await prisma.template.findMany({
    include: {
      templateTasks: {
        orderBy: { position: "asc" },
      },
    },
  });

  const catalogOrder = new Map(defaultTemplateCatalog.map((template, index) => [template.name, index]));

  return templates.sort((left, right) => {
    const leftOrder = catalogOrder.get(left.name) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = catalogOrder.get(right.name) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.name.localeCompare(right.name, "es");
  });
};

export const applyTemplate = async (userId, templateId, payload) => {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      templateTasks: {
        orderBy: { position: "asc" },
      },
    },
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
