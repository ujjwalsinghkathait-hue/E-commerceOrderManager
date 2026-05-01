export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white/80 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-400">
      <p>{new Date().getFullYear()} · E-commerce Order Manager</p>
    </footer>
  );
}
