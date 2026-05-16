# VS Code Manual GitHub Push and Railway Deploy

## 1. Open Project in VS Code

Open this folder:

```txt
C:\Users\Harshu\Documents\New project
```

## 2. Publish to GitHub from VS Code

1. Open the Source Control icon from the left sidebar.
2. Click `Publish to GitHub`.
3. Sign in to GitHub if VS Code asks.
4. Repository name:

```txt
team-task-manager
```

5. Choose `Public` unless your assignment requires `Private`.
6. Commit message:

```txt
Initial team task manager app
```

7. Click `Publish Branch` or `Sync Changes`.

Files like `.env`, `.env.local`, `node_modules`, `.next`, and `dist` are ignored through `.gitignore`.

## 3. Railway Deployment from GitHub

Create one Railway project with three services.

### PostgreSQL

1. Railway dashboard -> `New Project`.
2. Add `PostgreSQL`.
3. Copy the database `DATABASE_URL`.

### API Service

1. Add new service from GitHub repo.
2. Select this repository.
3. Set Root Directory:

```txt
/apps/api
```

4. Railway will read `apps/api/railway.json` for build and start commands.
5. Add environment variables:

```txt
DATABASE_URL=<Railway PostgreSQL DATABASE_URL>
JWT_SECRET=<long random secret at least 32 characters>
JWT_EXPIRES_IN=7d
CLIENT_URL=<frontend Railway public URL>
COOKIE_DOMAIN=
NODE_ENV=production
```

6. Generate a public domain for the API service.

### Web Service

1. Add another service from the same GitHub repo.
2. Set Root Directory:

```txt
/apps/web
```

3. Railway will read `apps/web/railway.json`.
4. Add environment variable:

```txt
NEXT_PUBLIC_API_URL=https://your-api-domain.up.railway.app/api
```

5. Generate a public domain for the web service.

## 4. Final Railway Fix

After the web service gets its final public URL, go back to the API service and update:

```txt
CLIENT_URL=https://your-web-domain.up.railway.app
```

Then redeploy the API service.
