"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex flex-1 justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  if (user.role !== "admin") {
    router.replace("/");
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8 lg:grid lg:grid-cols-[200px_1fr]">
      <aside className="hidden lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Admin
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 ${
                pathname === l.href
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                pathname === l.href
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
