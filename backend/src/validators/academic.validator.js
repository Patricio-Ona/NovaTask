import { z } from "zod";

const optionalUuid = z.string().uuid().optional().nullable();

export const createTermSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(160),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateTermSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(160).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    termId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const termIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    termId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const createSubjectSchema = z.object({
  body: z.object({
    academicTermId: optionalUuid,
    name: z.string().min(3).max(160),
    code: z.string().min(2).max(40).optional().or(z.literal("")),
    instructor: z.string().max(160).optional().or(z.literal("")),
    color: z.string().min(4).max(20).default("#6366F1"),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    academicTermId: optionalUuid,
    name: z.string().min(3).max(160).optional(),
    code: z.string().min(2).max(40).optional().or(z.literal("")),
    instructor: z.string().max(160).optional().or(z.literal("")),
    color: z.string().min(4).max(20).optional(),
  }),
  params: z.object({
    subjectId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const subjectIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    subjectId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const createEventSchema = z.object({
  body: z.object({
    subjectId: optionalUuid,
    projectId: optionalUuid,
    title: z.string().min(3).max(180),
    description: z.string().max(2000).optional().or(z.literal("")),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    allDay: z.boolean().optional(),
    type: z.enum(["CLASS", "EXAM", "MEETING", "PERSONAL", "DEADLINE"]).optional(),
    color: z.string().min(4).max(20).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateEventSchema = z.object({
  body: z.object({
    subjectId: optionalUuid,
    projectId: optionalUuid,
    title: z.string().min(3).max(180).optional(),
    description: z.string().max(2000).optional().or(z.literal("")).nullable(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    allDay: z.boolean().optional(),
    type: z.enum(["CLASS", "EXAM", "MEETING", "PERSONAL", "DEADLINE"]).optional(),
    color: z.string().min(4).max(20).optional(),
  }),
  params: z.object({
    eventId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});

export const eventIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    eventId: z.string().uuid(),
  }),
  query: z.object({}).optional(),
});
