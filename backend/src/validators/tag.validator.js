import { z } from "zod";

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(60),
    color: z.string().min(4).max(20),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
