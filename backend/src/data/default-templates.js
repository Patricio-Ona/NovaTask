import { TaskPriority, TaskStatus } from "@prisma/client";

export const defaultTemplateCatalog = [
  {
    name: "Semana de examenes",
    description: "Planifica repaso, entregas y bloques de estudio intensivo.",
    color: "#6366F1",
    tasks: [
      {
        title: "Registrar fechas de examen",
        description: "Cargar las fechas clave del periodo y revisar cruces con otras entregas.",
        priority: TaskPriority.HIGH,
      },
      {
        title: "Bloques de estudio por materia",
        description: "Separar sesiones de repaso de acuerdo con la dificultad de cada asignatura.",
      },
      {
        title: "Checklist diario de repaso",
        description: "Controlar avances, temas pendientes y resultados de autoevaluacion.",
      },
      {
        title: "Simulacion final",
        description: "Resolver preguntas, ejercicios o casos antes del dia del examen.",
        status: TaskStatus.REVIEW,
      },
    ],
  },
  {
    name: "Proyecto grupal",
    description: "Coordina roles, entregables y seguimiento del equipo.",
    color: "#8B5CF6",
    tasks: [
      {
        title: "Definir integrantes y roles",
        description: "Acordar responsables, tiempos de respuesta y responsables por seccion.",
        priority: TaskPriority.HIGH,
      },
      {
        title: "Crear cronograma comun",
        description: "Distribuir hitos, reuniones y entregas parciales por semana.",
      },
      {
        title: "Reunir fuentes y material base",
        description: "Consolidar bibliografia, enlaces y recursos necesarios para el proyecto.",
      },
      {
        title: "Reunion de avance",
        description: "Revisar bloqueos, pendientes y siguientes pasos del equipo.",
        status: TaskStatus.IN_PROGRESS,
      },
    ],
  },
  {
    name: "Trabajo final",
    description: "Estructura una entrega completa desde la investigacion hasta la revision.",
    color: "#22C55E",
    tasks: [
      {
        title: "Definir alcance y tema",
        description: "Aclarar objetivo, entregable esperado y criterios de evaluacion.",
        priority: TaskPriority.HIGH,
      },
      {
        title: "Reunir bibliografia",
        description: "Seleccionar fuentes, normas o referentes utiles para el documento.",
      },
      {
        title: "Redactar borrador",
        description: "Preparar la primera version del trabajo con estructura completa.",
      },
      {
        title: "Revision final",
        description: "Corregir formato, ortografia, anexos y detalles antes de entregar.",
        status: TaskStatus.REVIEW,
      },
    ],
  },
  {
    name: "Semana productiva",
    description: "Organiza una semana equilibrada con clases, entregas y repasos.",
    color: "#F59E0B",
    tasks: [
      {
        title: "Definir tres prioridades",
        description: "Elegir las tareas mas importantes de la semana y ordenarlas por impacto.",
        priority: TaskPriority.HIGH,
      },
      {
        title: "Bloques de enfoque",
        description: "Reservar tiempo profundo para avanzar sin distracciones.",
      },
      {
        title: "Revision a mitad de semana",
        description: "Confirmar si el ritmo actual es suficiente o necesita ajustes.",
        status: TaskStatus.IN_PROGRESS,
      },
      {
        title: "Cierre semanal",
        description: "Revisar lo logrado y dejar preparada la siguiente semana.",
      },
    ],
  },
  {
    name: "Seguimiento de tesis",
    description: "Ordena avances, revisiones y entregables del trabajo de titulacion.",
    color: "#0EA5E9",
    tasks: [
      {
        title: "Actualizar objetivos",
        description: "Revisar alcance, entregables activos y observaciones pendientes.",
        priority: TaskPriority.HIGH,
      },
      {
        title: "Avance de redaccion",
        description: "Registrar progreso por capitulo o seccion del documento.",
        status: TaskStatus.IN_PROGRESS,
      },
      {
        title: "Ajustar producto o prototipo",
        description: "Corregir la parte tecnica para que coincida con la memoria escrita.",
      },
      {
        title: "Enviar para revision",
        description: "Compartir avances con tutor o lector para recibir observaciones.",
        status: TaskStatus.REVIEW,
      },
    ],
  },
  {
    name: "Presentacion oral",
    description: "Prepara una exposicion clara con guion, diapositivas y practica.",
    color: "#EC4899",
    tasks: [
      {
        title: "Definir estructura",
        description: "Ordenar introduccion, desarrollo, demostracion y cierre.",
        priority: TaskPriority.HIGH,
      },
      {
        title: "Preparar diapositivas",
        description: "Sintetizar ideas clave y apoyarlas con material visual.",
      },
      {
        title: "Ensayo con tiempo real",
        description: "Practicar la presentacion completa respetando el tiempo disponible.",
      },
      {
        title: "Ajustes finales de discurso",
        description: "Pulir seguridad al hablar, transiciones y respuestas esperadas.",
        status: TaskStatus.REVIEW,
      },
    ],
  },
];

