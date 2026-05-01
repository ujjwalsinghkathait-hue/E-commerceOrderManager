"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, ready, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cart
          </Link>
          {user && (
            <Link
              href="/orders"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              My orders
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="font-medium text-zinc-900 dark:text-zinc-50"
            >
              Admin
            </Link>
          )}
          {!ready ? (
            <span className="text-xs text-zinc-400">…</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-zinc-500 sm:inline">
                {user.name}
              </span>
              <Button type="button" variant="secondary" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
