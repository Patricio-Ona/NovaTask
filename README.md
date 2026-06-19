# NovaTask

NovaTask es una plataforma SaaS academica orientada a la organizacion universitaria. Permite gestionar proyectos, tareas, materias, eventos y entregas desde una interfaz moderna, responsive y pensada como producto de tesis para Ingenieria en Sistemas.

## Enlaces oficiales

- GitHub: [https://github.com/Patricio-Ona/NovaTask](https://github.com/Patricio-Ona/NovaTask)
- Frontend en Vercel: [https://nova-task-eight.vercel.app/](https://nova-task-eight.vercel.app/)
- Backend publicado: [https://novatask-api.onrender.com/api/health](https://novatask-api.onrender.com/api/health)

## Estado del proyecto

El repositorio ya incluye:

- frontend en React 18 + Vite + Tailwind CSS + Framer Motion + Recharts + Zustand + @dnd-kit
- backend en Node.js + Express
- persistencia en PostgreSQL + Prisma
- autenticacion propia con JWT + bcryptjs
- modulos de Dashboard, Proyectos, Kanban, Lista, Calendario, Perfil, Plantillas y Analiticas
- estructura preparada para despliegue en produccion

## Funcionalidades principales

- registro e inicio de sesion con correo y contrasena
- proteccion de rutas privadas
- CRUD completo de proyectos
- CRUD completo de tareas y subtareas
- tablero Kanban con arrastrar y soltar
- vista de lista con filtros
- calendario mensual y semanal
- plantillas academicas reutilizables
- analiticas visuales
- modo oscuro y modo claro

## Estructura del repositorio

- frontend/: aplicacion cliente
- backend/: API REST, controladores, servicios, validaciones y Prisma
- database/schema.sql: esquema SQL base
- db/schema.sql: copia de apoyo para documentacion
- docs/: documentos tecnicos y material academico
- render.yaml: configuracion de despliegue del backend
- docker-compose.yml: stack local con base de datos

## Variables de entorno

### Frontend

Archivo de referencia: frontend/.env.example

Variables principales:

- VITE_API_URL
- VITE_DEMO_MODE
- VITE_ROUTER_MODE
- VITE_APP_BASE_PATH

### Backend

Archivo de referencia: backend/.env.example

Variables principales:

- DATABASE_URL
- PORT
- NODE_ENV
- CLIENT_URL
- CLIENT_URLS
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- MAIL_ENABLED
- MAIL_HOST
- MAIL_PORT
- MAIL_SECURE
- MAIL_USER
- MAIL_PASSWORD
- MAIL_FROM_NAME
- MAIL_FROM_ADDRESS

### Ejemplo consolidado

Tambien existe un ejemplo general en .env.example

## Instalacion local

### Backend

bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run dev


### Frontend

bash
cd frontend
npm install
copy .env.example .env
npm run dev


### Docker

bash
docker compose up --build


## Usuario de prueba del seed

- correo: patricio@novatask.dev
- contrasena: Patricio123*

## Scripts utiles

### Frontend

- npm run dev
- npm run build
- npm run preview

### Backend

- npm run dev
- npm run start
- npm run start:deploy
- npm run prisma:generate
- npm run prisma:deploy
- npm run prisma:migrate
- npm run prisma:validate
- npm run prisma:seed

## Despliegue

### Frontend

- directorio principal: frontend/
- archivo de configuracion: frontend/vercel.json
- variable clave: VITE_API_URL

### Backend

- directorio principal: backend/
- archivo de configuracion principal: render.yaml
- variables clave: DATABASE_URL, CLIENT_URL, CLIENT_URLS, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

## Checklist antes de publicar cambios

1. Verificar variables de entorno del frontend y backend.
2. Confirmar conexion correcta con PostgreSQL.
3. Ejecutar migraciones y seed si aplica.
4. Probar registro e inicio de sesion.
5. Probar creacion de proyectos y tareas.
6. Revisar Kanban, calendario, lista, perfil y plantillas.
7. Ejecutar npm run build en frontend antes de desplegar.

## Seguridad y arquitectura

- contrasenas hasheadas con bcryptjs
- autenticacion basada en JWT
- validacion con Zod
- Helmet activo en backend
- CORS configurable por origen
- manejo centralizado de errores
- arquitectura separada por rutas, controladores, servicios, middleware, validadores y utilidades

## Base de datos

Modelos principales:

- users
- academic_terms
- subjects
- projects
- tasks
- subtasks
- tags
- task_tags
- events
- activity_logs
- refresh_tokens
- templates
- template_tasks

Fuentes principales del modelo de datos:

- backend/prisma/schema.prisma
- database/schema.sql

## Observacion

Este repositorio corresponde al desarrollo practico de NovaTask como plataforma academica funcional, preparada para pruebas, documentacion de tesis y despliegue web.
