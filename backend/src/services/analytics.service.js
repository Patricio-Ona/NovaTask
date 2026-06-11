import { TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { startOfWeek } from "../utils/date.js";

const statusOrder = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE];
const priorityOrder = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];

export const getAnalyticsOverview = async (userId) => {
  const tasks = await prisma.task.findMany({
    where: { project: { userId } },
    include: {
      project: {
        select: { id: true, title: true, color: true, dueDate: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const total = tasks.length;
  const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;
  const overdue = tasks.filter(
    (task) => task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE
  ).length;
  const inProgress = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
  const review = tasks.filter((task) => task.status === TaskStatus.REVIEW).length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;

  const projectMap = new Map();
  tasks.forEach((task) => {
    const current = projectMap.get(task.project.title) ?? 0;
    projectMap.set(task.project.title, current + 1);
  });

  const weeklyBuckets = [...Array(6)].map((_, index) => {
    const weekDate = startOfWeek(new Date());
    weekDate.setDate(weekDate.getDate() - index * 7);
    return {
      label: `Semana ${6 - index}`,
      start: weekDate,
      created: 0,
      completed: 0,
    };
  }).reverse();

  tasks.forEach((task) => {
    weeklyBuckets.forEach((bucket) => {
      const end = new Date(bucket.start);
      end.setDate(end.getDate() + 7);

      if (task.createdAt >= bucket.start && task.createdAt < end) {
        bucket.created += 1;
      }

      if (task.status === TaskStatus.DONE && task.updatedAt >= bucket.start && task.updatedAt < end) {
        bucket.completed += 1;
      }
    });
  });

  const statusBreakdown = statusOrder.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length,
  }));

  const priorityBreakdown = priorityOrder.map((priority) => ({
    priority,
    count: tasks.filter((task) => task.priority === priority).length,
  }));

  const projectRollup = new Map();
  tasks.forEach((task) => {
    const current =
      projectRollup.get(task.project.id) ??
      {
        id: task.project.id,
        title: task.project.title,
        color: task.project.color,
        dueDate: task.project.dueDate,
        total: 0,
        completed: 0,
        overdue: 0,
      };

    current.total += 1;
    if (task.status === TaskStatus.DONE) {
      current.completed += 1;
    }
    if (task.dueDate && task.dueDate < new Date() && task.status !== TaskStatus.DONE) {
      current.overdue += 1;
    }

    projectRollup.set(task.project.id, current);
  });

  const completionByProject = Array.from(projectRollup.values())
    .map((project) => ({
      ...project,
      completionRate: project.total ? Math.round((project.completed / project.total) * 100) : 0,
    }))
    .sort((left, right) => right.total - left.total);

  const upcomingDeadlines = tasks
    .filter((task) => task.dueDate && task.status !== TaskStatus.DONE)
    .sort((left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime())
    .slice(0, 6)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      projectTitle: task.project.title,
      projectColor: task.project.color,
    }));

  return {
    summary: {
      totalTasks: total,
      completionRate,
      overdue,
      inProgress,
      review,
    },
    byProject: Array.from(projectMap.entries()).map(([name, value]) => ({ name, value })),
    weeklyProgress: weeklyBuckets.map(({ label, created, completed }) => ({
      label,
      created,
      completed,
    })),
    statusBreakdown,
    priorityBreakdown,
    completionByProject,
    upcomingDeadlines,
  };
};
