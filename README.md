# NovaTask

NovaTask es una plataforma SaaS academica para organizar proyectos, tareas, materias, eventos y entregas universitarias desde una experiencia moderna pensada para una tesis de Ingenieria en Sistemas.

## Estado del proyecto

El repositorio ya incluye:

- frontend en `React 18 + Vite + Tailwind CSS + Framer Motion + Recharts + Zustand + @dnd-kit`
- backend en `Node.js + Express`
- persistencia en `PostgreSQL + Prisma`
- autenticacion propia con `JWT + bcryptjs`
- `Kanban`, `Lista`, `Calendario`, `Dashboard`, `Perfil`, `Plantillas` y `Analiticas`
- archivos listos para despliegue en `Vercel`, `Netlify`, `Render`, `Railway` y `Docker`

## Estructura

- `frontend/`: aplicacion cliente
- `backend/`: API REST, Prisma, seed, validaciones y servicios
- `database/schema.sql`: esquema SQL principal
- `db/schema.sql`: copia de apoyo para documentacion
- `docs/`: documentos tecnicos
- `render.yaml`: blueprint para Render
- `docker-compose.yml`: stack local con PostgreSQL

## Variables de entorno

### Frontend

Revisa [frontend/.env.example](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/frontend/.env.example)

- `VITE_API_URL`
- `VITE_DEMO_MODE`
- `VITE_ROUTER_MODE`
- `VITE_APP_BASE_PATH`

### Backend

Revisa [backend/.env.example](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/backend/.env.example)

- `DATABASE_URL`
- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `CLIENT_URLS`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_ENABLED`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_SECURE`
- `MAIL_USER`
- `MAIL_PASSWORD`
- `MAIL_FROM_NAME`
- `MAIL_FROM_ADDRESS`

### Ejemplo consolidado

Tambien tienes un ejemplo raiz en [.env.example](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/.env.example)

## Instalacion local

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

### Docker completo

```bash
docker compose up --build
```

Servicios:

- frontend: `http://localhost:8080`
- backend: `http://localhost:4000/api`
- postgres: `localhost:5432`

## Usuario de prueba del seed

- correo: `patricio@novatask.dev`
- contrasena: `Patricio123*`

## Scripts utiles

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`

### Backend

- `npm run dev`
- `npm run start`
- `npm run start:deploy`
- `npm run prisma:generate`
- `npm run prisma:deploy`
- `npm run prisma:migrate`
- `npm run prisma:validate`
- `npm run prisma:seed`

## Despliegue

### Opcion recomendada

- frontend en `Vercel`
- backend en `Render` o `Railway`
- base de datos en `Render PostgreSQL`, `Railway PostgreSQL` o `Neon`

### Frontend en Vercel

1. Importa el repositorio en Vercel.
2. Define `frontend/` como `Root Directory`.
3. La app ya incluye [frontend/vercel.json](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/frontend/vercel.json) para rutas SPA.
4. Configura estas variables:
   - `VITE_API_URL=https://tu-backend.onrender.com/api`
   - `VITE_ROUTER_MODE=browser`
   - `VITE_APP_BASE_PATH=/`

### Frontend en Netlify

1. Importa el repositorio en Netlify.
2. Usa `frontend/` como `Base directory`.
3. Ya existe [netlify.toml](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/netlify.toml) y `frontend/public/_redirects`.
4. Variables:
   - `VITE_API_URL=https://tu-backend.onrender.com/api`
   - `VITE_ROUTER_MODE=browser`
   - `VITE_APP_BASE_PATH=/`

### Frontend en GitHub Pages

GitHub Pages requiere `HashRouter` para evitar problemas de rutas:

1. El repositorio ya incluye el workflow [deploy-pages.yml](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/.github/workflows/deploy-pages.yml).
2. En GitHub ve a `Settings > Pages`.
3. En `Build and deployment`, selecciona `GitHub Actions`.
4. En `Settings > Secrets and variables > Actions > Variables`, crea:
   - `VITE_API_URL=https://tu-backend.onrender.com/api`
5. El workflow ya construye con:
   - `VITE_ROUTER_MODE=hash`
   - `VITE_APP_BASE_PATH=/NovaTask/`
6. Cada `push` a `main` publicara el frontend automaticamente.
7. El proyecto ya incluye `frontend/public/.nojekyll`.

URL esperada:

```text
https://patricio-ona.github.io/NovaTask/
```

Nota:

- `GitHub Pages` solo publica el frontend.
- Para que el sistema funcione completo, el backend debe seguir desplegado en `Render` o `Railway`.

### Backend en Render

1. Sube el repositorio a GitHub.
2. Importa el repo en Render.
3. Usa [render.yaml](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/render.yaml).
4. Solo completa:
   - `CLIENT_URL`
   - `CLIENT_URLS`
   - variables SMTP si usaras correo

### Backend en Railway

1. Crea un servicio apuntando a `backend/`.
2. Ya existen [backend/railway.json](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/backend/railway.json) y [backend/nixpacks.toml](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/backend/nixpacks.toml).
3. Configura:
   - `DATABASE_URL`
   - `CLIENT_URL`
   - `CLIENT_URLS`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`

### Docker

Tambien quedan listos:

- [backend/Dockerfile](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/backend/Dockerfile)
- [frontend/Dockerfile](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/frontend/Dockerfile)
- [docker-compose.yml](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/docker-compose.yml)

## Checklist antes de publicar

1. Subir el repositorio a GitHub.
2. Crear la base PostgreSQL.
3. Desplegar `backend/`.
4. Configurar `DATABASE_URL`, `CLIENT_URL`, `CLIENT_URLS` y secretos JWT.
5. Desplegar `frontend/`.
6. Configurar `VITE_API_URL` apuntando al backend publicado.
7. Probar:
   - registro
   - login
   - crear proyecto
   - mover tareas en kanban
   - vista lista
   - calendario
   - perfil
   - plantillas
   - logout

## Seguridad y produccion

- contrasenas hasheadas con `bcryptjs`
- tokens de acceso y refresh separados
- validacion con `Zod`
- `Helmet` activo
- `CORS` configurable por origen
- manejo centralizado de errores
- rutas SPA preparadas para Vercel y Netlify
- soporte de `BrowserRouter` o `HashRouter` segun el host

## Base de datos

Modelos principales:

- `users`
- `academic_terms`
- `subjects`
- `projects`
- `tasks`
- `subtasks`
- `tags`
- `task_tags`
- `events`
- `activity_logs`
- `refresh_tokens`
- `templates`
- `template_tasks`

La fuente principal del modelo relacional esta en [backend/prisma/schema.prisma](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/backend/prisma/schema.prisma) y el SQL completo en [database/schema.sql](/C:/Users/59396/Documents/Codex/2026-04-20-files-mentioned-by-the-user-plan/database/schema.sql).
