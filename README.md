# Team Task Manager

A production-style full-stack assignment project: a simplified Trello/Asana-style team task manager with project roles, task assignment, analytics, and Railway deployment support.

## Tech Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT in secure HTTP-only cookies, bcrypt password hashing
- State/API: Axios and TanStack React Query
- Deployment: Railway

## Project Architecture

The app is organized as a monorepo with independent Railway services for the API and web app.

```txt
team-task-manager/
  apps/
    api/       Express REST API, Prisma schema, auth, role middleware
    web/       Next.js dashboard UI
  docs/        Architecture, deployment, and testing notes
```

The backend owns business rules and authorization. The frontend stays thin: it calls REST endpoints, renders role-aware controls, and handles loading/empty/error states.

## Quick Start

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:4000`.

## Demo Accounts After Seed

```txt
Admin:  admin@example.com  /  Password123!
Member: member@example.com /  Password123!
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Testing Guide](docs/api-testing.md)
- [Railway Deployment](docs/deployment.md)
- [VS Code GitHub Push + Railway Deploy](docs/vscode-github-railway.md)
- [Interview Notes](docs/interview-notes.md)
