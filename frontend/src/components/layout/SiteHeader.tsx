"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { fetchCart } from "@/lib/api/cart";
import { useGuestCartUnitCount } from "@/lib/cart/useGuestCart";
import { queryKeys } from "@/lib/queryKeys";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.98] dark:hover:bg-zinc-800 dark:hover:text-zinc-50 ${
        active
          ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/25 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-black/20"
          : "text-zinc-600 dark:text-zinc-400"
      }`}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, ready, logout } = useAuth();
  const guestCartCount = useGuestCartUnitCount();

  const cartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: fetchCart,
    select: (data) => data.summary.unitCount,
    enabled: ready && Boolean(user),
    staleTime: 30 * 1000,
  });

  const cartCount = user ? (cartQuery.data ?? 0) : guestCartCount;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/75 shadow-sm shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/75 dark:shadow-black/20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-lg outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg text-white shadow-lg shadow-blue-600/30 transition group-hover:shadow-blue-600/45">
            ◆
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <NavLink href="/">Shop</NavLink>
          <Link
            href="/cart"
            className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] dark:hover:bg-zinc-800 ${
              pathname === "/cart"
                ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/25 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-black/20"
                : cartCount > 0
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-zinc-950">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {user && <NavLink href="/orders">Orders</NavLink>}
          {user?.role === "admin" && (
            <NavLink href="/admin">Admin</NavLink>
          )}
          {!ready ? (
            <span className="px-3 py-1.5 text-xs text-zinc-400">Loading…</span>
          ) : user ? (
            <div className="ml-1 flex items-center gap-2 border-l border-zinc-200 pl-3 dark:border-zinc-700">
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">
                Hi, <span className="font-medium text-zinc-800 dark:text-zinc-200">{user.name}</span>
              </span>
              <Button type="button" variant="secondary" onClick={() => logout()} className="!py-1.5 !text-xs">
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <NavLink href="/login">Sign in</NavLink>
              <Link
                href="/register"
                className="ml-1 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:shadow-lg hover:shadow-blue-600/35 active:scale-[0.98] dark:from-blue-500 dark:to-indigo-500"
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
