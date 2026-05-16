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
DATABASE_URL=postgresql://...
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-web-service.up.railway.app
COOKIE_DOMAIN=
NODE_ENV=production
PORT=4000
```

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
```

## 4. Final Checks

- Open the web URL.
- Sign up or use seeded users if you ran the seed command.
- Create a project.
- Add a member.
- Create and assign tasks.
- Confirm dashboard counts update.
