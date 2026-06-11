BEGIN;

UPDATE users
SET name = 'Patricio Ona'
WHERE email = 'patricio@novatask.dev';

UPDATE tags
SET name = 'Diseno'
WHERE name = 'UI/UX';

UPDATE projects
SET title = 'Trabajo de titulacion',
    description = 'Proyecto principal para el desarrollo y validacion de la plataforma.'
WHERE title ILIKE 'Trabajo de Titul%';

UPDATE projects
SET title = 'Arquitectura de software',
    description = 'Entregables, reuniones y avance de la materia.'
WHERE title ILIKE 'Arquitectura de Software';

UPDATE tasks
SET title = 'Disenar panel principal',
    description = 'Resumen semanal, deadlines y metricas del sistema.'
WHERE title ILIKE '%dashboard principal%';

UPDATE tasks
SET title = 'Implementar autenticacion completa',
    description = 'Registro, inicio de sesion, refresco de sesion y cierre seguro.'
WHERE title ILIKE 'Implementar autentic%';

UPDATE tasks
SET title = 'Preparar cuestionario SUS',
    description = 'Instrumento de usabilidad para la fase experimental.'
WHERE title ILIKE 'Preparar cuestionario SUS';

UPDATE subtasks
SET title = 'Topbar y metricas'
WHERE title ILIKE 'Topbar y m%';

UPDATE subtasks
SET title = 'Estados vacios'
WHERE title ILIKE 'Estados vac%';

DELETE FROM template_tasks;
DELETE FROM templates;

WITH inserted AS (
  INSERT INTO templates (name, description, color)
  VALUES ('Semana de examenes', 'Planifica repaso, entregas y bloques de estudio intensivo.', '#6366F1')
  RETURNING id
)
INSERT INTO template_tasks (template_id, title, description, priority, status, position)
SELECT id, 'Registrar fechas de examen', 'Cargar las fechas clave del periodo.', 'HIGH'::task_priority, 'TODO'::task_status, 1 FROM inserted
UNION ALL
SELECT id, 'Bloques de estudio por materia', 'Organizar sesiones por asignatura.', 'MEDIUM'::task_priority, 'TODO'::task_status, 2 FROM inserted
UNION ALL
SELECT id, 'Checklist diario de repaso', 'Seguimiento del progreso academico diario.', 'MEDIUM'::task_priority, 'TODO'::task_status, 3 FROM inserted;

WITH inserted AS (
  INSERT INTO templates (name, description, color)
  VALUES ('Proyecto grupal', 'Coordina roles, entregables y seguimiento del equipo.', '#8B5CF6')
  RETURNING id
)
INSERT INTO template_tasks (template_id, title, description, priority, status, position)
SELECT id, 'Definir integrantes y roles', 'Acordar responsables y tiempos.', 'HIGH'::task_priority, 'TODO'::task_status, 1 FROM inserted
UNION ALL
SELECT id, 'Crear cronograma comun', 'Distribuir hitos por semana.', 'MEDIUM'::task_priority, 'TODO'::task_status, 2 FROM inserted
UNION ALL
SELECT id, 'Reunion de avance', 'Revisar bloqueos y siguientes pasos.', 'MEDIUM'::task_priority, 'IN_PROGRESS'::task_status, 3 FROM inserted;

WITH inserted AS (
  INSERT INTO templates (name, description, color)
  VALUES ('Trabajo final', 'Estructura una entrega completa desde la investigacion hasta la revision.', '#22C55E')
  RETURNING id
)
INSERT INTO template_tasks (template_id, title, description, priority, status, position)
SELECT id, 'Definir alcance y tema', 'Aclarar objetivo, entregable y criterios.', 'HIGH'::task_priority, 'TODO'::task_status, 1 FROM inserted
UNION ALL
SELECT id, 'Redactar borrador', 'Preparar la primera version del documento.', 'MEDIUM'::task_priority, 'TODO'::task_status, 2 FROM inserted
UNION ALL
SELECT id, 'Revision final', 'Corregir formato, ortografia y anexos.', 'MEDIUM'::task_priority, 'REVIEW'::task_status, 3 FROM inserted;

WITH inserted AS (
  INSERT INTO templates (name, description, color)
  VALUES ('Semana productiva', 'Organiza una semana equilibrada con clases, entregas y repasos.', '#F59E0B')
  RETURNING id
)
INSERT INTO template_tasks (template_id, title, description, priority, status, position)
SELECT id, 'Definir tres prioridades', 'Elegir las tareas mas importantes de la semana.', 'HIGH'::task_priority, 'TODO'::task_status, 1 FROM inserted
UNION ALL
SELECT id, 'Bloques de enfoque', 'Reservar tiempo profundo para avanzar.', 'MEDIUM'::task_priority, 'TODO'::task_status, 2 FROM inserted
UNION ALL
SELECT id, 'Cierre semanal', 'Revisar lo logrado y planificar lo siguiente.', 'MEDIUM'::task_priority, 'TODO'::task_status, 3 FROM inserted;

WITH inserted AS (
  INSERT INTO templates (name, description, color)
  VALUES ('Seguimiento de tesis', 'Ordena avances, revisiones y entregables del trabajo de titulacion.', '#0EA5E9')
  RETURNING id
)
INSERT INTO template_tasks (template_id, title, description, priority, status, position)
SELECT id, 'Actualizar objetivos', 'Revisar alcance y entregables activos.', 'HIGH'::task_priority, 'TODO'::task_status, 1 FROM inserted
UNION ALL
SELECT id, 'Avance de redaccion', 'Registrar progreso por capitulo.', 'MEDIUM'::task_priority, 'IN_PROGRESS'::task_status, 2 FROM inserted
UNION ALL
SELECT id, 'Enviar para revision', 'Compartir avances con tutor o lector.', 'MEDIUM'::task_priority, 'REVIEW'::task_status, 3 FROM inserted;

WITH inserted AS (
  INSERT INTO templates (name, description, color)
  VALUES ('Presentacion oral', 'Prepara una exposicion clara con guion, diapositivas y practica.', '#EC4899')
  RETURNING id
)
INSERT INTO template_tasks (template_id, title, description, priority, status, position)
SELECT id, 'Definir estructura', 'Introduccion, desarrollo y cierre.', 'HIGH'::task_priority, 'TODO'::task_status, 1 FROM inserted
UNION ALL
SELECT id, 'Preparar diapositivas', 'Sintetizar ideas clave con apoyo visual.', 'MEDIUM'::task_priority, 'TODO'::task_status, 2 FROM inserted
UNION ALL
SELECT id, 'Ensayo con tiempo real', 'Practicar la presentacion completa.', 'MEDIUM'::task_priority, 'TODO'::task_status, 3 FROM inserted;

COMMIT;
