import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    avatarUrl: z.string().url().optional().or(z.literal("")),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(120).optional(),
    avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});
