# API Testing Guide

Base URL:

```txt
http://localhost:4000/api
```

The API uses HTTP-only cookies for the browser and also accepts `Authorization: Bearer <token>` for API testing tools.

## Signup

```bash
curl -i -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Demo Admin\",\"email\":\"demo@example.com\",\"password\":\"Password123!\"}"
```

## Login

```bash
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"Password123!\"}"
```

Copy the returned `token` for non-browser requests.

## Create Project

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Website Redesign\",\"description\":\"Launch the new marketing site.\"}"
```

## Add Member

```bash
curl -X POST http://localhost:4000/api/projects/PROJECT_ID/members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"member@example.com\",\"role\":\"MEMBER\"}"
```

## Create Task

```bash
curl -X POST http://localhost:4000/api/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Create wireframes\",\"description\":\"Draft dashboard screens\",\"priority\":\"HIGH\",\"status\":\"TODO\",\"assigneeId\":\"USER_ID\",\"dueDate\":\"2026-05-25T00:00:00.000Z\"}"
```

## Update Task Status

```bash
curl -X PATCH http://localhost:4000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"IN_PROGRESS\"}"
```

## Dashboard

```bash
curl http://localhost:4000/api/projects/PROJECT_ID/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```
