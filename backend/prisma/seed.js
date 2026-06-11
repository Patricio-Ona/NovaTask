import "dotenv/config";
import bcrypt from "bcryptjs";
import { EventType, PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function createTemplate(name, description, color, tasks) {
  const template = await prisma.template.create({
    data: {
      name,
      description,
      color,
    },
  });

  await prisma.templateTask.createMany({
    data: tasks.map((task, index) => ({
      templateId: template.id,
      title: task.title,
      description: task.description,
      priority: task.priority ?? TaskPriority.MEDIUM,
      status: task.status ?? TaskStatus.TODO,
      position: index + 1,
    })),
  });

  return template;
}

async function main() {
  await prisma.taskTag.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.event.deleteMany();
  await prisma.project.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicTerm.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.templateTask.deleteMany();
  await prisma.template.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Patricio123*", 10);

  const user = await prisma.user.create({
    data: {
      name: "Patricio Ona",
      email: "patricio@novatask.dev",
      passwordHash,
      avatarUrl: "https://api.dicebear.com/8.x/initials/svg?seed=Patricio",
    },
  });

  const activeTerm = await prisma.academicTerm.create({
    data: {
      userId: user.id,
      name: "PUCE 2026-1",
      startDate: new Date("2026-04-01T00:00:00.000Z"),
      endDate: new Date("2026-08-31T23:59:59.000Z"),
      isActive: true,
    },
  });

  const [softwareSubject, thesisSubject, dataSubject] = await Promise.all([
    prisma.subject.create({
      data: {
        userId: user.id,
        academicTermId: activeTerm.id,
        name: "Arquitectura de software",
        code: "SIS-401",
        instructor: "Ing. Fabian Montaluisa",
        color: "#8B5CF6",
      },
    }),
    prisma.subject.create({
      data: {
        userId: user.id,
        academicTermId: activeTerm.id,
        name: "Trabajo de titulacion",
        code: "TIT-499",
        instructor: "Ing. Tutor PUCE",
        color: "#6366F1",
      },
    }),
    prisma.subject.create({
      data: {
        userId: user.id,
        academicTermId: activeTerm.id,
        name: "Analitica de datos",
        code: "SIS-390",
        instructor: "Ing. Gabriela Andrade",
        color: "#0EA5E9",
      },
    }),
  ]);

  const [urgentTag, researchTag, uiTag, examTag] = await Promise.all([
    prisma.tag.create({ data: { userId: user.id, name: "Urgente", color: "#EF4444" } }),
    prisma.tag.create({ data: { userId: user.id, name: "Investigacion", color: "#8B5CF6" } }),
    prisma.tag.create({ data: { userId: user.id, name: "Diseno", color: "#6366F1" } }),
    prisma.tag.create({ data: { userId: user.id, name: "Examen", color: "#F59E0B" } }),
  ]);

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        userId: user.id,
        subjectId: thesisSubject.id,
        title: "NovaTask MVP",
        description: "Proyecto principal para el desarrollo, validacion y defensa de la plataforma.",
        color: "#6366F1",
        dueDate: new Date("2026-07-19T20:00:00.000Z"),
      },
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        subjectId: softwareSubject.id,
        title: "Arquitectura y despliegue",
        description: "Entregables, reuniones y avance de la materia.",
        color: "#8B5CF6",
        dueDate: new Date("2026-06-15T18:00:00.000Z"),
      },
    }),
    prisma.project.create({
      data: {
        userId: user.id,
        subjectId: dataSubject.id,
        title: "Panel de analiticas",
        description: "Metricas del uso y rendimiento academico.",
        color: "#0EA5E9",
        dueDate: new Date("2026-06-28T18:00:00.000Z"),
      },
    }),
  ]);

  const thesisTasks = await Promise.all([
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        title: "Disenar panel principal",
        description: "Resumen semanal, deadlines, materias activas y metricas del sistema.",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date("2026-06-10T21:00:00.000Z"),
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        title: "Implementar autenticacion completa",
        description: "Registro, inicio de sesion, refresco de sesion y cierre seguro.",
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        dueDate: new Date("2026-06-12T21:00:00.000Z"),
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[0].id,
        title: "Preparar cuestionario SUS",
        description: "Instrumento de usabilidad para la fase experimental.",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.REVIEW,
        dueDate: new Date("2026-06-14T21:00:00.000Z"),
        position: 3,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[1].id,
        title: "Configurar despliegue inicial",
        description: "Preparar frontend y backend para Vercel y Railway.",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date("2026-06-16T20:00:00.000Z"),
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: projects[2].id,
        title: "Graficar avance semanal",
        description: "Comparar tareas creadas vs completadas.",
        priority: TaskPriority.HIGH,
        status: TaskStatus.DONE,
        dueDate: new Date("2026-06-05T17:00:00.000Z"),
        position: 1,
      },
    }),
  ]);

  await prisma.subtask.createMany({
    data: [
      { taskId: thesisTasks[0].id, title: "Topbar y metricas", completed: true },
      { taskId: thesisTasks[0].id, title: "Materias activas", completed: false },
      { taskId: thesisTasks[1].id, title: "Access token", completed: false },
      { taskId: thesisTasks[1].id, title: "Refresh token", completed: false },
      { taskId: thesisTasks[4].id, title: "Serie temporal", completed: true },
      { taskId: thesisTasks[4].id, title: "Resumen porcentual", completed: true },
    ],
  });

  await prisma.taskTag.createMany({
    data: [
      { taskId: thesisTasks[0].id, tagId: uiTag.id },
      { taskId: thesisTasks[0].id, tagId: urgentTag.id },
      { taskId: thesisTasks[2].id, tagId: researchTag.id },
      { taskId: thesisTasks[3].id, tagId: urgentTag.id },
      { taskId: thesisTasks[4].id, tagId: examTag.id },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        userId: user.id,
        subjectId: thesisSubject.id,
        projectId: projects[0].id,
        title: "Revision de avance con tutor",
        description: "Revisar el estado del MVP y el avance metodologico.",
        startAt: new Date("2026-06-11T15:00:00.000Z"),
        endAt: new Date("2026-06-11T16:00:00.000Z"),
        type: EventType.MEETING,
        color: "#6366F1",
      },
      {
        userId: user.id,
        subjectId: softwareSubject.id,
        projectId: projects[1].id,
        title: "Clase de arquitectura",
        description: "Revision de patrones y despliegue.",
        startAt: new Date("2026-06-12T13:00:00.000Z"),
        endAt: new Date("2026-06-12T15:00:00.000Z"),
        type: EventType.CLASS,
        color: "#8B5CF6",
      },
      {
        userId: user.id,
        subjectId: dataSubject.id,
        title: "Exposicion de analiticas",
        description: "Presentacion del modulo de reportes.",
        startAt: new Date("2026-06-14T14:00:00.000Z"),
        endAt: new Date("2026-06-14T15:30:00.000Z"),
        type: EventType.EXAM,
        color: "#0EA5E9",
      },
      {
        userId: user.id,
        title: "Bloque personal de enfoque",
        description: "Espacio de concentracion para escribir el informe.",
        startAt: new Date("2026-06-09T08:00:00.000Z"),
        endAt: new Date("2026-06-09T10:00:00.000Z"),
        type: EventType.PERSONAL,
        color: "#22C55E",
      },
    ],
  });

  await createTemplate("Semana de examenes", "Planifica repaso, entregas y bloques de estudio intensivo.", "#6366F1", [
    {
      title: "Registrar fechas de examen",
      description: "Cargar las fechas clave del periodo.",
      priority: TaskPriority.HIGH,
    },
    {
      title: "Bloques de estudio por materia",
      description: "Organizar sesiones por asignatura.",
    },
    {
      title: "Checklist diario de repaso",
      description: "Seguimiento del progreso academico diario.",
    },
  ]);

  await createTemplate("Proyecto grupal", "Coordina roles, entregables y seguimiento del equipo.", "#8B5CF6", [
    {
      title: "Definir integrantes y roles",
      description: "Acordar responsables y tiempos.",
      priority: TaskPriority.HIGH,
    },
    {
      title: "Crear cronograma comun",
      description: "Distribuir hitos por semana.",
    },
    {
      title: "Reunion de avance",
      description: "Revisar bloqueos y siguientes pasos.",
      status: TaskStatus.IN_PROGRESS,
    },
  ]);

  await createTemplate("Semana de titulacion", "Ordena entregables, reuniones, revisiones y practicas de defensa.", "#22C55E", [
    {
      title: "Actualizar capitulo pendiente",
      description: "Avanzar redaccion y correcciones.",
      priority: TaskPriority.HIGH,
    },
    {
      title: "Reunion con tutor",
      description: "Resolver observaciones y siguientes pasos.",
      status: TaskStatus.REVIEW,
    },
    {
      title: "Practicar defensa",
      description: "Ensayar presentacion con tiempo real.",
    },
  ]);

  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: projects[0].id,
      },
      {
        userId: user.id,
        action: "TASK_MOVED_TO_IN_PROGRESS",
        entityType: "TASK",
        entityId: thesisTasks[0].id,
      },
      {
        userId: user.id,
        action: "SUBJECT_CREATED",
        entityType: "SUBJECT",
        entityId: thesisSubject.id,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
