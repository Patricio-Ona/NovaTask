import { z } from "zod";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
const statusEnum = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);

export const listTasksSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    projectId: z.string().uuid().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    search: z.string().min(1).max(160).optional(),
  }),
});

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
    title: z.string().min(3).max(180),
    description: z.string().max(3000).optional().or(z.literal("")),
    priority: priorityEnum.default("MEDIUM"),
    status: statusEnum.default("TODO"),
    dueDate: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional(),
    tagIds: z.array(z.string().uuid()).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(180).optional(),
    description: z.string().max(3000).optional().nullable(),
    priority: priorityEnum.optional(),
    status: statusEnum.optional(),
    dueDate: z.string().datetime().optional().nullable(),
    position: z.number().int().min(0).optional(),
    tagIds: z.array(z.string().uuid()).optional(),
  }),
  params: z.object({
    taskId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const moveTaskSchema = z.object({
  body: z.object({
    status: statusEnum,
    position: z.number().int().min(0),
  }),
  params: z.object({
    taskId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const createSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(180),
  }),
  params: z.object({
    taskId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const updateSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(180).optional(),
    completed: z.boolean().optional(),
  }),
  params: z.object({
    subtaskId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const taskIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    taskId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});
