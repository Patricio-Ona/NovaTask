# NovaTask

NovaTask es una plataforma SaaS acadmica orientada a la organización universitaria. Permite gestionar proyectos, tareas, materias, eventos y entregas desde una interfaz moderna, responsive y pensada como producto de tesis para Ingeniería en Sistemas.

## Enlaces oficiales

- GitHub: [https://github.com/Patricio-Ona/NovaTask](https://github.com/Patricio-Ona/NovaTask)
- Frontend en Vercel: [https://nova-task-eight.vercel.app/](https://nova-task-eight.vercel.app/)
- Backend publicado: [https://novatask-api.onrender.com/api/health](https://novatask-api.onrender.com/api/health)

## Estado del proyecto

El repositorio ya incluye:

- Frontend en React 18 + Vite + Tailwind CSS + Framer Motion + Recharts + Zustand + @dnd-kit
- Backend en Node.js + Express
- Persistencia en PostgreSQL + Prisma
- Autenticación propia con JWT + bcryptjs
- MÓdulos de Dashboard, Proyectos, Kanban, Lista, Calendario, Perfil, Plantillas y Analíticas
- Estructura preparada para despliegue en producción

## Funcionalidades principales

- Registro e inicio de sesión con correo y contraseña.
- Protección de rutas privadas
- CRUD completo de proyectos
- CRUD completo de tareas y subtareas
- Tablero Kanban con arrastrar y soltar
- Vista de lista con filtros
- Calendario mensual y semanal
- Plantillas académicas reutilizables
- Analiticas visuales
- Modo oscuro y modo claro

## Estructura del repositorio

- frontend/: aplicación cliente
- backend/: API REST, controladores, servicios, validaciones y Prisma
- database/schema.sql: esquema SQL base
- db/schema.sql: copia de apoyo para documentación
- docs/: documentos técnicos y material académico
- render.yaml: configuración de despliegue del backend
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

También existe un ejemplo general en .env.example

## Instalación local

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


## Usuario de prueba

- Correo: patricio@novatask.dev
- Contraseña: Patricio123*

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

- Directorio principal: frontend/
- Archivo de configuración: frontend/vercel.json
- Variable clave: VITE_API_URL

### Backend

- Directorio principal: backend/
- Archivo de configuración principal: render.yaml
- Variables clave: DATABASE_URL, CLIENT_URL, CLIENT_URLS, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

## Checklist antes de publicar cambios

1. Verificar variables de entorno del frontend y backend.
2. Confirmar conexión correcta con PostgreSQL.
3. Ejecutar migraciones y seed si aplica.
4. Probar registro e inicio de sesión.
5. Probar creación de proyectos y tareas.
6. Revisar Kanban, calendario, lista, perfil y plantillas.
7. Ejecutar npm run build en frontend antes de desplegar.

## Seguridad y arquitectura

- Contraseñas hasheadas con bcryptjs
- Autenticación basada en JWT
- Validación con Zod
- Helmet activo en backend
- CORS configurable por origen
- Manejo centralizado de errores
- Arquitectura separada por rutas, controladores, servicios, middleware, validadores y utilidades

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

## Observación

Este repositorio corresponde al desarrollo práctico de NovaTask como plataforma académica funcional, preparada para pruebas, documentación y despliegue web.
