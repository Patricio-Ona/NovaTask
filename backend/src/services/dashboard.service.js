import { TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { startOfWeek } from "../utils/date.js";

const statusOrder = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE];
const weekDayLabels = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

const statusLabels = {
  [TaskStatus.TODO]: "Pendientes",
  [TaskStatus.IN_PROGRESS]: "En progreso",
  [TaskStatus.REVIEW]: "En revision",
  [TaskStatus.DONE]: "Completadas",
};

const priorityWeight = {
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1,
};

const isSameCalendarDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const getDashboardOverview = async (userId) => {
  const [projects, tasks, activities, activeTerm, subjects, events] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        color: true,
        dueDate: true,
        subject: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: { project: { userId } },
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
        subtasks: {
          select: {
            completed: true,
          },
        },
      },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.academicTerm.findFirst({
      where: { userId, isActive: true },
      select: { id: true, name: true, startDate: true, endDate: true },
    }),
    prisma.subject.findMany({
      where: { userId },
      include: {
        academicTerm: {
          select: { id: true, name: true, isActive: true },
        },
        projects: {
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: {
        userId,
        startAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      include: {
        subject: {
          select: { id: true, name: true, color: true },
        },
        project: {
          select: { id: true, title: true, color: true },
        },
      },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
  ]);

  const weekStart = startOfWeek();
  const today = new Date();
  const openTasks = tasks.filter((task) => task.status !== TaskStatus.DONE);
  const completedThisWeek = tasks.filter(
    (task) => task.status === TaskStatus.DONE && task.updatedAt >= weekStart
  ).length;
  const overdueCount = tasks.filter(
    (task) => task.dueDate && task.dueDate < today && task.status !== TaskStatus.DONE
  ).length;
  const dueSoon = tasks.filter(
    (task) => task.dueDate && task.dueDate >= today && task.status !== TaskStatus.DONE
  ).slice(0, 5);
  const completionRate = tasks.length
    ? Math.round((tasks.filter((task) => task.status === TaskStatus.DONE).length / tasks.length) * 100)
    : 0;
  const dueToday = openTasks.filter((task) => task.dueDate && isSameCalendarDay(task.dueDate, today)).length;
  const highPriorityOpen = openTasks.filter((task) => task.priority === TaskPriority.HIGH).length;
  const activeSubjects = subjects.filter(
    (subject) => !activeTerm || subject.academicTerm?.id === activeTerm.id || subject.academicTerm === null
  );

  const focusTasks = [...openTasks]
    .sort((left, right) => {
      const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (leftDue !== rightDue) {
        return leftDue - rightDue;
      }
      return priorityWeight[right.priority] - priorityWeight[left.priority];
    })
    .slice(0, 4)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      projectTitle: task.project.title,
      projectColor: task.project.color,
      subjectName: task.project.subject?.name ?? null,
      completedSubtasks: task.subtasks.filter((subtask) => subtask.completed).length,
      totalSubtasks: task.subtasks.length,
    }));

  const statusBreakdown = statusOrder.map((status) => ({
    status,
    label: statusLabels[status],
    count: tasks.filter((task) => task.status === status).length,
  }));

  const weeklyLoad = [...Array(7)].map((_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);

    const dayTasks = openTasks.filter((task) => task.dueDate && isSameCalendarDay(task.dueDate, date));
    const dayEvents = events.filter((event) => isSameCalendarDay(new Date(event.startAt), date));

    return {
      label: weekDayLabels[date.getDay()],
      date: date.toISOString(),
      count: dayTasks.length + dayEvents.length,
      tasks: dayTasks.length,
      events: dayEvents.length,
      highPriority: dayTasks.filter((task) => task.priority === TaskPriority.HIGH).length,
    };
  });

  return {
    metrics: {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      totalSubjects: activeSubjects.length,
      completedThisWeek,
      overdueCount,
      completionRate,
      dueToday,
      highPriorityOpen,
      scheduledEvents: events.length,
    },
    activeTerm,
    activeSubjects: activeSubjects.slice(0, 6).map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      instructor: subject.instructor,
      color: subject.color,
      projectCount: subject.projects.length,
    })),
    upcomingEvents: events.map((event) => ({
      id: event.id,
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
      type: event.type,
      color: event.color,
      subjectName: event.subject?.name ?? null,
      projectTitle: event.project?.title ?? null,
    })),
    dueSoon,
    focusTasks,
    statusBreakdown,
    weeklyLoad,
    projectSummaries: projects.map((project) => ({
      ...project,
      subjectName: project.subject?.name ?? null,
      tasks: tasks.filter((task) => task.projectId === project.id).length,
      completed: tasks.filter((task) => task.projectId === project.id && task.status === TaskStatus.DONE).length,
    })),
    activity: activities,
  };
};
