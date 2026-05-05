# Frontend (Next.js)

Storefront and admin UI for **E-commerce Order Manager**. Uses the **App Router**, **Tailwind CSS**, **TanStack Query**, and **Axios** against the Express API.

## Setup

```bash
npm install
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL` to your API base **including `/api`**, e.g. `http://localhost:5000/api`. The backend must allow this app’s origin in **`CLIENT_ORIGIN`** (CORS).

Optional: **`NEXT_PUBLIC_IMAGE_HOSTS`** — comma-separated hostnames (e.g. `cdn.example.com`) so product image URLs on those hosts use `next/image` optimization. Built-in defaults include Unsplash, Picsum, `placehold.co`, and Google user content; other URLs still load via a plain `<img>` with lazy loading.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (default port 3000) |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |

## Deploy on Vercel

1. New Project → import this repo.  
2. **Root directory:** `frontend`.  
3. Add **`NEXT_PUBLIC_API_URL`** in Project → Settings → Environment Variables (production URL of your API, e.g. `https://api.example.com/api`).

Full checklist (Atlas, API host, CORS): **[../DEPLOYMENT.md](../DEPLOYMENT.md)**.
