# Contrato de API Actual

## Auth

### POST /api/auth/register

```json
{
  "name": "Patricio Oña",
  "email": "patricio@novatask.dev",
  "password": "Patricio123*",
  "avatarUrl": "https://..."
}
```

### POST /api/auth/login

```json
{
  "email": "patricio@novatask.dev",
  "password": "Patricio123*"
}
```

### POST /api/auth/refresh

```json
{
  "refreshToken": "jwt"
}
```

### GET /api/auth/me

Retorna el usuario autenticado.

## Projects

### GET /api/projects

Lista proyectos del usuario autenticado.

### POST /api/projects

```json
{
  "title": "Trabajo de Titulación",
  "description": "Proyecto principal",
  "color": "#6366F1",
  "dueDate": "2026-07-19T20:00:00.000Z"
}
```

### PATCH /api/projects/:projectId

Actualiza proyecto.

### DELETE /api/projects/:projectId

Elimina proyecto y sus tareas por cascada.

## Tasks

### POST /api/tasks

```json
{
  "projectId": "uuid",
  "title": "Diseñar dashboard",
  "description": "Nueva vista principal",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-05-18T20:00:00.000Z",
  "position": 0,
  "tagIds": ["uuid"]
}
```

### PATCH /api/tasks/:taskId

Permite modificar título, descripción, prioridad, estado, fecha y tags.

### PATCH /api/tasks/:taskId/move

```json
{
  "status": "IN_PROGRESS",
  "position": 1
}
```

### DELETE /api/tasks/:taskId

Elimina la tarea.

## Subtasks

### POST /api/tasks/:taskId/subtasks

```json
{
  "title": "Topbar del dashboard"
}
```

### PATCH /api/tasks/subtasks/:subtaskId

```json
{
  "completed": true
}
```

## Tags

### GET /api/tags

Lista tags disponibles.

### POST /api/tags

```json
{
  "name": "Investigación",
  "color": "#8B5CF6"
}
```

## Dashboard

### GET /api/dashboard/overview

Retorna métricas, deadlines próximos, resumen por proyecto y actividad reciente.

## Calendar

### GET /api/calendar

Retorna tareas con fecha límite para la vista calendario.

## Analytics

### GET /api/analytics/overview

Retorna:

- summary
- byProject
- weeklyProgress

## Templates

### GET /api/templates

Lista plantillas y tareas base.

### POST /api/templates/:templateId/apply

```json
{
  "projectTitle": "Semana de exámenes · Mayo",
  "description": "Planificación intensiva",
  "dueDate": "2026-05-31T22:00:00.000Z"
}
```
