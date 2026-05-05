import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-md shadow-zinc-900/5 ring-1 ring-black/[0.03] backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-black/20 dark:ring-white/[0.05] ${className}`}
      {...props}
    />
  );
}
