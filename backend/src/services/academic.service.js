import { AppError } from "../utils/AppError.js";
import { prisma } from "../utils/prisma.js";
import { logActivity } from "./activity.service.js";

const ensureTermOwnership = async (termId, userId) => {
  const term = await prisma.academicTerm.findFirst({
    where: { id: termId, userId },
  });

  if (!term) {
    throw new AppError("Periodo academico no encontrado", 404);
  }

  return term;
};

const ensureSubjectOwnership = async (subjectId, userId) => {
  if (!subjectId) {
    return null;
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId },
  });

  if (!subject) {
    throw new AppError("Materia no encontrada", 404);
  }

  return subject;
};

const ensureProjectOwnership = async (projectId, userId) => {
  if (!projectId) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new AppError("Proyecto no encontrado", 404);
  }

  return project;
};

const setActiveTerm = async (tx, userId, termId) => {
  await tx.academicTerm.updateMany({
    where: { userId, id: { not: termId } },
    data: { isActive: false },
  });
};

export const getAcademicOverview = async (userId) => {
  const [terms, subjects, events] = await Promise.all([
    prisma.academicTerm.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { startDate: "desc" }],
    }),
    prisma.subject.findMany({
      where: { userId },
      include: {
        academicTerm: {
          select: { id: true, name: true, isActive: true },
        },
        projects: {
          select: { id: true, title: true, color: true, dueDate: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { userId },
      include: {
        subject: {
          select: { id: true, name: true, color: true },
        },
        project: {
          select: { id: true, title: true, color: true },
        },
      },
      orderBy: { startAt: "asc" },
      take: 20,
    }),
  ]);

  const activeTerm = terms.find((term) => term.isActive) ?? null;

  return {
    activeTerm,
    terms,
    subjects,
    events,
    stats: {
      totalTerms: terms.length,
      totalSubjects: subjects.length,
      totalEvents: events.length,
      subjectsInActiveTerm: activeTerm
        ? subjects.filter((subject) => subject.academicTermId === activeTerm.id).length
        : 0,
    },
  };
};

export const createTerm = async (userId, payload) => {
  const term = await prisma.$transaction(async (tx) => {
    const created = await tx.academicTerm.create({
      data: {
        userId,
        name: payload.name,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        isActive: payload.isActive ?? false,
      },
    });

    if (created.isActive) {
      await setActiveTerm(tx, userId, created.id);
    }

    return created;
  });

  await logActivity({
    userId,
    action: "TERM_CREATED",
    entityType: "TERM",
    entityId: term.id,
  });

  return term;
};

export const updateTerm = async (termId, userId, payload) => {
  await ensureTermOwnership(termId, userId);

  const term = await prisma.$transaction(async (tx) => {
    const updated = await tx.academicTerm.update({
      where: { id: termId },
      data: {
        name: payload.name,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        endDate: payload.endDate ? new Date(payload.endDate) : undefined,
        isActive: payload.isActive,
      },
    });

    if (updated.isActive) {
      await setActiveTerm(tx, userId, updated.id);
    }

    return updated;
  });

  await logActivity({
    userId,
    action: "TERM_UPDATED",
    entityType: "TERM",
    entityId: term.id,
  });

  return term;
};

export const deleteTerm = async (termId, userId) => {
  await ensureTermOwnership(termId, userId);
  await prisma.academicTerm.delete({ where: { id: termId } });

  await logActivity({
    userId,
    action: "TERM_DELETED",
    entityType: "TERM",
    entityId: termId,
  });

  return { success: true };
};

export const createSubject = async (userId, payload) => {
  await ensureTermOwnership(payload.academicTermId, userId).catch((error) => {
    if (payload.academicTermId) throw error;
  });

  const existing = await prisma.subject.findFirst({
    where: {
      userId,
      name: payload.name,
    },
  });

  if (existing) {
    throw new AppError("Ya existe una materia con ese nombre", 409);
  }

  const subject = await prisma.subject.create({
    data: {
      userId,
      academicTermId: payload.academicTermId || null,
      name: payload.name,
      code: payload.code || null,
      instructor: payload.instructor || null,
      color: payload.color || "#6366F1",
    },
    include: {
      academicTerm: {
        select: { id: true, name: true, isActive: true },
      },
    },
  });

  await logActivity({
    userId,
    action: "SUBJECT_CREATED",
    entityType: "SUBJECT",
    entityId: subject.id,
  });

  return subject;
};

export const updateSubject = async (subjectId, userId, payload) => {
  await ensureSubjectOwnership(subjectId, userId);
  await ensureTermOwnership(payload.academicTermId, userId).catch((error) => {
    if (payload.academicTermId) throw error;
  });

  const subject = await prisma.subject.update({
    where: { id: subjectId },
    data: {
      academicTermId: payload.academicTermId === undefined ? undefined : payload.academicTermId || null,
      name: payload.name,
      code: payload.code === undefined ? undefined : payload.code || null,
      instructor: payload.instructor === undefined ? undefined : payload.instructor || null,
      color: payload.color,
    },
    include: {
      academicTerm: {
        select: { id: true, name: true, isActive: true },
      },
    },
  });

  await logActivity({
    userId,
    action: "SUBJECT_UPDATED",
    entityType: "SUBJECT",
    entityId: subject.id,
  });

  return subject;
};

export const deleteSubject = async (subjectId, userId) => {
  await ensureSubjectOwnership(subjectId, userId);
  await prisma.subject.delete({ where: { id: subjectId } });

  await logActivity({
    userId,
    action: "SUBJECT_DELETED",
    entityType: "SUBJECT",
    entityId: subjectId,
  });

  return { success: true };
};

export const createEvent = async (userId, payload) => {
  await ensureSubjectOwnership(payload.subjectId, userId);
  await ensureProjectOwnership(payload.projectId, userId);

  const event = await prisma.event.create({
    data: {
      userId,
      subjectId: payload.subjectId || null,
      projectId: payload.projectId || null,
      title: payload.title,
      description: payload.description || null,
      startAt: new Date(payload.startAt),
      endAt: new Date(payload.endAt),
      allDay: payload.allDay ?? false,
      type: payload.type ?? "PERSONAL",
      color: payload.color || "#0EA5E9",
    },
    include: {
      subject: {
        select: { id: true, name: true, color: true },
      },
      project: {
        select: { id: true, title: true, color: true },
      },
    },
  });

  await logActivity({
    userId,
    action: "EVENT_CREATED",
    entityType: "EVENT",
    entityId: event.id,
  });

  return event;
};

export const updateEvent = async (eventId, userId, payload) => {
  const existing = await prisma.event.findFirst({
    where: { id: eventId, userId },
  });

  if (!existing) {
    throw new AppError("Evento no encontrado", 404);
  }

  await ensureSubjectOwnership(payload.subjectId, userId);
  await ensureProjectOwnership(payload.projectId, userId);

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      subjectId: payload.subjectId === undefined ? undefined : payload.subjectId || null,
      projectId: payload.projectId === undefined ? undefined : payload.projectId || null,
      title: payload.title,
      description: payload.description === undefined ? undefined : payload.description || null,
      startAt: payload.startAt ? new Date(payload.startAt) : undefined,
      endAt: payload.endAt ? new Date(payload.endAt) : undefined,
      allDay: payload.allDay,
      type: payload.type,
      color: payload.color,
    },
    include: {
      subject: {
        select: { id: true, name: true, color: true },
      },
      project: {
        select: { id: true, title: true, color: true },
      },
    },
  });

  await logActivity({
    userId,
    action: "EVENT_UPDATED",
    entityType: "EVENT",
    entityId: event.id,
  });

  return event;
};

export const deleteEvent = async (eventId, userId) => {
  const existing = await prisma.event.findFirst({
    where: { id: eventId, userId },
  });

  if (!existing) {
    throw new AppError("Evento no encontrado", 404);
  }

  await prisma.event.delete({ where: { id: eventId } });

  await logActivity({
    userId,
    action: "EVENT_DELETED",
    entityType: "EVENT",
    entityId: eventId,
  });

  return { success: true };
};
