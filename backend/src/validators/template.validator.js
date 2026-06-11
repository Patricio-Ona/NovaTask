import { z } from "zod";

export const applyTemplateSchema = z.object({
  body: z.object({
    projectTitle: z.string().min(3).max(180),
    description: z.string().max(2000).optional().or(z.literal("")),
    dueDate: z.string().datetime().optional().nullable(),
  }),
  params: z.object({
    templateId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});
