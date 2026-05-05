export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="aspect-[4/3] animate-pulse bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/4 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-5 w-1/3 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
