const EVENT_TYPE_LABELS = {
  CLASS: "Clase",
  EXAM: "Examen",
  MEETING: "Reunion",
  PERSONAL: "Personal",
  DEADLINE: "Fecha limite",
};

const ENTITY_TYPE_LABELS = {
  AUTH: "Acceso",
  PROJECT: "Proyecto",
  TASK: "Tarea",
  SUBTASK: "Subtarea",
  TEMPLATE: "Plantilla",
  EVENT: "Evento",
  USER: "Usuario",
  SUBJECT: "Materia",
  TERM: "Periodo",
};

const CHART_SERIES_LABELS = {
  value: "Tareas",
  tasks: "Tareas",
  created: "Creadas",
  completed: "Completadas",
  porcentaje: "Porcentaje",
};

const normalizeLabel = (value) => {
  const text = String(value ?? "").replaceAll("_", " ").toLowerCase().trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getEventTypeLabel = (value) => EVENT_TYPE_LABELS[value] ?? normalizeLabel(value);

export const getEntityTypeLabel = (value) => ENTITY_TYPE_LABELS[value] ?? normalizeLabel(value);

export const getChartSeriesLabel = (value) => CHART_SERIES_LABELS[value] ?? normalizeLabel(value);
