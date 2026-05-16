# Interview Explanation Points

## Product Scope

This app is a focused team task manager. It includes the core workflows interviewers expect: authentication, project membership, role-based permissions, task assignment, dashboard analytics, and deployment.

## Architecture

The system uses a monorepo with separate frontend and backend services. This keeps deployment clear on Railway while still making local development simple.

## Authorization

Roles are project-scoped through `ProjectMember`. Admins can manage members and tasks. Members can only view assigned projects and update the status of tasks assigned to them.

## Security

Passwords are hashed with bcrypt. JWTs are stored in HTTP-only cookies in the browser, which avoids exposing tokens to JavaScript. The API also accepts bearer tokens for API testing.

## Database Design

`ProjectMember` resolves the many-to-many relationship between users and projects and stores the role for each project. Tasks belong to projects and optionally reference an assigned user.

## Frontend

React Query manages server state and cache invalidation after mutations. The UI uses reusable shadcn/ui-style components, dark mode, responsive layout, loading states, empty states, and toast feedback.

## Tradeoffs

The assignment avoids real-time collaboration and email invitations to keep the build interview-friendly. Those features can be added later with WebSockets and an email provider without changing the core schema.
