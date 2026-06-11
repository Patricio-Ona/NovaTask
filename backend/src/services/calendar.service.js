import { prisma } from "../utils/prisma.js";

export const getCalendarItems = async (userId) => {
  const [tasks, events] = await Promise.all([
    prisma.task.findMany({
      where: {
        project: { userId },
        dueDate: { not: null },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            color: true,
            subject: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        subtasks: true,
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.event.findMany({
      where: { userId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const taskItems = tasks.map((task) => ({
    id: task.id,
    itemType: "TASK",
    title: task.title,
    projectId: task.project.id,
    projectTitle: task.project.title,
    projectColor: task.project.color,
    subjectName: task.project.subject?.name ?? null,
    dueDate: task.dueDate,
    startAt: task.dueDate,
    endAt: task.dueDate,
    status: task.status,
    priority: task.priority,
    completedSubtasks: task.subtasks.filter((subtask) => subtask.completed).length,
    totalSubtasks: task.subtasks.length,
    allDay: false,
    color: task.project.color,
  }));

  const eventItems = events.map((event) => ({
    id: event.id,
    itemType: "EVENT",
    title: event.title,
    description: event.description,
    projectId: event.project?.id ?? null,
    projectTitle: event.project?.title ?? null,
    projectColor: event.project?.color ?? event.subject?.color ?? event.color,
    subjectName: event.subject?.name ?? null,
    dueDate: event.startAt,
    startAt: event.startAt,
    endAt: event.endAt,
    status: event.type,
    priority: null,
    completedSubtasks: 0,
    totalSubtasks: 0,
    allDay: event.allDay,
    color: event.color,
    eventType: event.type,
  }));

  return [...taskItems, ...eventItems].sort(
    (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
  );
};
