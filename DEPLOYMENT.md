# Deployment guide

This project is a **monorepo**: **Next.js** (`frontend/`) and **Express + MongoDB** (`backend/`). In production the browser talks to the API over HTTPS; the API talks to **MongoDB Atlas** (or any MongoDB replica set).

---

## 1. MongoDB Atlas

1. Create a free cluster at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. **Database user** — create a user/password with read/write on your database.
3. **Network access** — allow your API host’s egress IPs, or (only for quick tests) `0.0.0.0/0`. Serverless-style hosts often need `0.0.0.0/0` unless you use a static outbound IP add-on.
4. **Connection string** — Drivers → Node.js → copy the SRV URI. Set `MONGODB_URI` on the API (see `.env.example` in `backend/`).

**Orders and stock** use **multi-document transactions**. Atlas M0+ provides a **replica set**. A single-node local `mongod` without a replica set may fail transactions with a clear error—use Atlas or a local replica set for full order flows.

---

## 2. API (Express) — hosting options

Deploy `backend/` as a long-running Node process. Common providers: [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform), AWS ECS/EC2, etc.

### Build & start

- **Install:** `npm install` (from `backend/` or use install command in the host UI).
- **Start:** `npm start` → runs `node server.js`.
- **Health check path:** `GET /api/health` (returns JSON).

### Required environment variables (API)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | Usually set by the host (e.g. Render injects `PORT`). |
| `MONGODB_URI` | Atlas connection string. |
| `JWT_SECRET` | Long random string (**≥ 32 characters** in production; enforced by `validateEnv`). |
| `JWT_EXPIRES_IN` | Optional, e.g. `7d`. |
| `CLIENT_ORIGIN` | **Exact** browser origin(s) of the Next.js app, comma-separated if several. Example: `https://your-app.vercel.app`. No trailing slash. |
| `BCRYPT_SALT_ROUNDS` | Optional; default `12`. |

Optional (see `backend/.env.example`):

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — only for `npm run seed:admin` when bootstrapping an admin in a controlled environment.

### CORS

The API uses `CLIENT_ORIGIN` for the CORS `origin` allowlist. After you know your Vercel URL, set:

`CLIENT_ORIGIN=https://<your-project>.vercel.app`

Preview deployments: either add each preview origin (comma-separated) or use a pattern via a small code change (not included by default).

### Trust proxy

With `NODE_ENV=production`, Express sets `trust proxy` so `req.ip` and related behavior work behind the provider’s reverse proxy.

---

## 3. Frontend (Next.js) on Vercel

1. Import the Git repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework: **Next.js** (auto-detected). Build: `npm run build`, Output: default.
4. **Environment variables** (Production + Preview as needed):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com/api` |

Must match how your API is mounted: this codebase serves routes under **`/api/...`** on the same host as Express, so the public URL should end with **`/api`** (no trailing slash after `api`, or normalize—see `getApiBaseUrl()` in the frontend).

5. Deploy. Open the Vercel URL and confirm the catalog loads; if not, check browser **Network** for CORS or wrong `NEXT_PUBLIC_API_URL`.

---

## 4. End-to-end checklist

- [ ] Atlas cluster + `MONGODB_URI` on API.
- [ ] API deployed; `GET https://<api-host>/api/health` returns 200.
- [ ] `CLIENT_ORIGIN` matches the exact Next.js origin (production and previews if needed).
- [ ] Vercel `NEXT_PUBLIC_API_URL` points to the **same** API base including `/api`.
- [ ] Strong `JWT_SECRET` in production.
- [ ] Run `npm run seed:admin` **once** in a secure shell against production only if you intend to create an admin (protect those env vars).

---

## 5. Local “production-like” run

From repo root (after `npm install` at root):

```bash
npm run install:all
```

Terminal 1 — API with production env file (example):

```bash
cd backend
set NODE_ENV=production
node server.js
```

Terminal 2 — Next production build:

```bash
cd frontend
npm run build
npm run start
```

Use real Atlas URI and set `CLIENT_ORIGIN` to `http://localhost:3000` when testing the production Next server locally.

---

## 6. Security reminders

- Never commit `.env` files; use host secrets / Vercel Environment Variables.
- Rotate `JWT_SECRET` if leaked (invalidates all sessions).
- Prefer least-privilege DB user and restricted Atlas network access over `0.0.0.0/0` when you have fixed API IPs.

For questions about a specific host’s UI (Render vs Railway), refer to that provider’s “Node Web Service” + environment variables documentation.
