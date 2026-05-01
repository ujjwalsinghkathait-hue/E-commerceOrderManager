"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { AUTH_TOKEN_KEY } from "@/lib/auth/storage";
import { AUTH_LOGOUT_EVENT } from "@/lib/auth/events";
import type { User } from "@/types/domain";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type ApiEnvelope<T> = { success: boolean; data: T };

type AuthPayload = { user: User; token: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const readToken = () =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(AUTH_TOKEN_KEY)
      : null;

  const refreshUser = useCallback(async () => {
    const token = readToken();
    if (!token) {
      setUser(null);
      return;
    }
    const res = await apiClient.get<ApiEnvelope<{ user: User }>>("/auth/me");
    setUser(res.data.data.user);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const onRemoteLogout = () => {
      setUser(null);
      queryClient.clear();
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, onRemoteLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onRemoteLogout);
  }, [queryClient]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = readToken();
        if (token) {
          const res = await apiClient.get<ApiEnvelope<{ user: User }>>(
            "/auth/me",
          );
          if (!cancelled) {
            setUser(res.data.data.user);
          }
        }
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem(AUTH_TOKEN_KEY);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiClient.post<ApiEnvelope<AuthPayload>>("/auth/login", {
      email,
      password,
    });
    window.localStorage.setItem(AUTH_TOKEN_KEY, res.data.data.token);
    setUser(res.data.data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await apiClient.post<ApiEnvelope<AuthPayload>>(
        "/auth/register",
        {
          name,
          email,
          password,
        },
      );
      window.localStorage.setItem(AUTH_TOKEN_KEY, res.data.data.token);
      setUser(res.data.data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      setUser,
      refreshUser,
    }),
    [user, ready, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
