# Arquitectura Actual de NovaTask

## Objetivo técnico

NovaTask se diseñó como una aplicación SaaS universitaria de arquitectura desacoplada, con una separación clara entre frontend, backend y persistencia. El objetivo es disponer de una base sólida para continuar el desarrollo real del MVP y sostener posteriormente la fase experimental de la tesis.

## Capas del sistema

### Frontend

- React
- Vite
- Tailwind CSS
- React Router DOM
- Framer Motion
- Recharts

Responsabilidades:

- autenticación visual y persistencia de sesión
- navegación protegida
- dashboard, proyectos, Kanban, calendario, analíticas y plantillas
- manejo de loaders, errores, estados vacíos y toasts

### Backend

- Node.js
- Express
- JWT
- bcryptjs
- Zod

Responsabilidades:

- autenticación propia
- validación de requests
- control de acceso por usuario
- orquestación del dominio
- exposición de API REST

### Persistencia

- PostgreSQL
- Prisma ORM

Responsabilidades:

- relaciones entre usuarios, proyectos, tareas y tags
- almacenamiento de tokens refresh
- registro de actividad
- templates reutilizables

## Organización del backend

- `routes/`
- `controllers/`
- `services/`
- `middleware/`
- `validators/`
- `utils/`
- `prisma/`

## Decisiones clave

1. No usar Firebase ni autenticación externa.
2. Mantener control total sobre usuarios, tokens, proyectos y métricas.
3. Usar Prisma como capa ORM principal.
4. Conservar el diseño SaaS moderno en dark mode fijo.
5. Dejar la API lista para crecer sin reestructuraciones drásticas.

## Flujo técnico principal

1. El usuario se registra o inicia sesión.
2. El backend emite `access token` y `refresh token`.
3. El frontend guarda la sesión y protege rutas.
4. Los módulos consultan la API REST para cargar datos.
5. Los cambios en proyectos y tareas se persisten en PostgreSQL mediante Prisma.
6. El dashboard, calendario y analíticas consumen la misma fuente de verdad.
