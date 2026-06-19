import { z } from "zod";
import { isFutureOrPresentDate } from "../utils/date.js";

const optionalFutureDueDate = z
  .string()
  .datetime()
  .refine(isFutureOrPresentDate, { message: "La fecha debe ser actual o futura." })
  .optional()
  .nullable();

export const applyTemplateSchema = z.object({
  body: z.object({
    projectTitle: z.string().min(3).max(180),
    description: z.string().max(2000).optional().or(z.literal("")),
    dueDate: optionalFutureDueDate,
  }),
  params: z.object({
    templateId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});
