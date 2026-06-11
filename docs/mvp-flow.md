# Flujo Actual del MVP

## 1. Acceso

1. El usuario se registra o inicia sesión.
2. El frontend almacena `access token` y `refresh token`.
3. Las rutas privadas quedan protegidas.

## 2. Gestión de proyectos

1. El usuario crea proyectos.
2. Cada proyecto funciona como contenedor del trabajo académico.
3. Los proyectos pueden editarse y eliminarse.

## 3. Gestión de tareas

1. El usuario crea tareas dentro de un proyecto.
2. Cada tarea tiene prioridad, estado, fecha límite y posición.
3. Puede asignar tags y subtareas.

## 4. Kanban

1. Las tareas se muestran agrupadas por estado.
2. El usuario arrastra una tarea entre columnas.
3. El cambio persiste mediante la API.

## 5. Calendario

1. Las tareas con fecha límite aparecen en la vista temporal.
2. El usuario identifica carga futura y urgencias.

## 6. Analíticas

1. La API calcula resumen de tareas.
2. El frontend renderiza gráficas con Recharts.
3. El usuario visualiza cumplimiento, tareas vencidas y distribución por proyecto.

## 7. Plantillas

1. El usuario selecciona una plantilla.
2. La API crea un proyecto nuevo desde esa plantilla.
3. Las tareas base quedan creadas en la base de datos.
