import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-white/60 py-10 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            E-commerce Order Manager
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} · Built with Next.js & Express
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="transition hover:text-blue-600 dark:hover:text-blue-400">
            Shop
          </Link>
          <Link href="/cart" className="transition hover:text-blue-600 dark:hover:text-blue-400">
            Cart
          </Link>
          <Link href="/login" className="transition hover:text-blue-600 dark:hover:text-blue-400">
            Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
