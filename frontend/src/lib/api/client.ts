import axios, { isAxiosError } from "axios";
import { getApiBaseUrl } from "@/lib/env";
import { AUTH_TOKEN_KEY } from "@/lib/auth/storage";
import { AUTH_LOGOUT_EVENT } from "@/lib/auth/events";

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * Clears stored JWT on 401 (except failed login/register) so React Query
 * retries do not loop with a bad token. Notifies `AuthProvider` via event.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const reqUrl = String(error.config?.url ?? "");
    const method = String(error.config?.method ?? "").toLowerCase();
    const isAuthAttempt =
      method === "post" &&
      (reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register"));

    if (isAuthAttempt) {
      return Promise.reject(error);
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }

    return Promise.reject(error);
  },
);
