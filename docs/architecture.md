# Architecture and Development Roadmap

## 1. Project Architecture

This project uses a two-service monorepo:

- `apps/api`: Express.js REST API with Prisma and PostgreSQL.
- `apps/web`: Next.js App Router frontend with React Query and Axios.

The API is the source of truth for authentication, authorization, validation, and database writes. The frontend renders a polished role-aware dashboard and never trusts client-side role checks for security.

## 2. Folder Structure

```txt
team-task-manager/
  apps/
    api/
      prisma/
        schema.prisma
        seed.ts
      src/
        config/
        middleware/
        modules/
          auth/
          dashboard/
          projects/
          tasks/
        types/
        utils/
        app.ts
        server.ts
    web/
      app/
        (auth)/
        (dashboard)/
      components/
        auth/
        dashboard/
        layout/
        providers/
        tasks/
        ui/
      lib/
      types/
  docs/
```

## 3. Database Schema

Core models:

- `User`: account profile and password hash.
- `Project`: workspace for tasks.
- `ProjectMember`: many-to-many join table between users and projects with a per-project role.
- `Task`: project task assigned to a user.
- `Activity`: recent project activity for dashboard timelines.

Roles are project-scoped. A user can be an Admin in one project and a Member in another, which is more realistic and easy to explain in interviews.

## 4. API Plan

Authentication:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `GET /api/projects/:projectId/members`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`

Tasks:

- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

Dashboard:

- `GET /api/projects/:projectId/dashboard`

## 5. Frontend Pages

- `/login`: secure login form.
- `/signup`: account creation.
- `/dashboard`: projects overview.
- `/projects/[projectId]`: project dashboard, task board/table, filters, members, analytics.

## 6. Step-by-Step Implementation

1. Scaffold the monorepo, TypeScript configs, Tailwind, and Prisma.
2. Implement auth with JWT cookies, bcrypt hashing, and protected API middleware.
3. Implement project membership and role-based permissions.
4. Implement task CRUD with Member restrictions.
5. Add dashboard analytics and recent activity.
6. Build responsive Next.js UI with loading states, empty states, validation, and toasts.
7. Add seed data, documentation, and API testing guide.
8. Deploy API, frontend, and PostgreSQL on Railway.

## 7. Deployment Guide

Deploy two Railway services from the same repository:

- API service root: `apps/api`
- Web service root: `apps/web`

Provision Railway PostgreSQL, set environment variables, run Prisma migrations, then connect the web service to the public API URL.

## 8. Interview Explanation Points

- Project roles are stored in the membership table, making permissions flexible.
- JWT is stored in HTTP-only cookies to reduce token exposure in the browser.
- The backend enforces every permission check; frontend checks are only UX.
- Prisma gives typed SQL relationships and simple deployable migrations.
- React Query keeps server state predictable with loading, error, and cache invalidation flows.
