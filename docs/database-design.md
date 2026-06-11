# Diseño de Base de Datos

## Fuente de verdad

La definición principal del modelo se encuentra en:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260511_init/migration.sql`

## Modelos implementados

### users

- id
- name
- email
- password_hash
- avatar_url
- created_at
- updated_at

### projects

- id
- user_id
- title
- description
- color
- due_date
- created_at
- updated_at

### tasks

- id
- project_id
- title
- description
- priority
- status
- due_date
- position
- created_at
- updated_at

### subtasks

- id
- task_id
- title
- completed
- created_at

### tags

- id
- name
- color

### task_tags

- task_id
- tag_id

### activity_logs

- id
- user_id
- action
- entity_type
- entity_id
- created_at

## Modelos de soporte añadidos

### refresh_tokens

Soporta persistencia básica de sesión y refresh token.

### templates

Define plantillas funcionales para crear proyectos reutilizables.

### template_tasks

Permite instanciar tareas base cuando una plantilla es aplicada.

## Relación principal

- `users 1:N projects`
- `projects 1:N tasks`
- `tasks 1:N subtasks`
- `tasks N:M tags` por medio de `task_tags`
- `users 1:N activity_logs`
- `users 1:N refresh_tokens`
- `templates 1:N template_tasks`

## Buenas prácticas incluidas

- llaves primarias UUID
- llaves foráneas explícitas
- índices en relaciones y filtros frecuentes
- `ON DELETE CASCADE` donde corresponde
- timestamps en entidades principales
- enums para `priority`, `status` y `entity_type`
