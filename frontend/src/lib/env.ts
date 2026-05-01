/**
 * Base URL for the Express API, including the `/api` prefix.
 *
 * - Local default: `http://localhost:5000/api` (must match backend `PORT` + `/api` routes).
 * - Production: set `NEXT_PUBLIC_API_URL` to your deployed API (https://api.example.com/api).
 * - Backend CORS: set `CLIENT_ORIGIN` to this Next.js origin (e.g. `http://localhost:3000`).
 */
export const getApiBaseUrl = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000/api";
  return raw.replace(/\/$/, "");
};
