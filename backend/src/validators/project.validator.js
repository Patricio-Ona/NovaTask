import { z } from "zod";
import { isFutureOrPresentDate } from "../utils/date.js";

const optionalFutureDueDate = z
  .string()
  .datetime()
  .refine(isFutureOrPresentDate, { message: "La fecha debe ser actual o futura." })
  .optional()
  .nullable();

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(180),
    description: z.string().max(2000).optional().or(z.literal("")),
    color: z.string().min(4).max(20).default("#6366F1"),
    dueDate: optionalFutureDueDate,
    subjectId: z.string().uuid().optional().nullable(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(180).optional(),
    description: z.string().max(2000).optional().nullable(),
    color: z.string().min(4).max(20).optional(),
    dueDate: optionalFutureDueDate,
    subjectId: z.string().uuid().optional().nullable(),
  }),
  params: z.object({
    projectId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const projectIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    projectId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});
