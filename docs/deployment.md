# Railway Deployment

## 1. Create Railway PostgreSQL

1. Create a new Railway project.
2. Add a PostgreSQL database.
3. Copy the generated `DATABASE_URL`.

## 2. Deploy the API

Create a Railway service connected to the GitHub repository.

Settings:

```txt
Root Directory: leave empty, or use /
Build Command: npm run build:api
Start Command: npm run start:api
```

Environment variables:

```txt
DATABASE_URL=postgresql://...  or  ${{Postgres.DATABASE_URL}}
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-web-service.up.railway.app
COOKIE_DOMAIN=
NODE_ENV=production
PORT=4000
RAILWAY_SERVICE_TARGET=api
```

`DATABASE_URL` must be the Railway PostgreSQL connection string. It cannot be the web URL, API URL, service name, or placeholder text. It should start with `postgresql://` or use Railway's variable reference to the PostgreSQL service.

## 3. Deploy the Web App

Create a second Railway service connected to the same repository.

Settings:

```txt
Root Directory: leave empty, or use /
Build Command: npm run build:web
Start Command: npm run start:web
```

Environment variables:

```txt
NEXT_PUBLIC_API_URL=https://your-api-service.up.railway.app/api
RAILWAY_SERVICE_TARGET=web
```

## 4. Final Checks

- Open the web URL.
- Sign up or use seeded users if you ran the seed command.
- Create a project.
- Add a member.
- Create and assign tasks.
- Confirm dashboard counts update.
