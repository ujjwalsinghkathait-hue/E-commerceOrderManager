"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import type { Category, Pagination, Product } from "@/types/domain";

type ListResponse = {
  products: Product[];
  pagination: Pagination;
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price · low" },
  { value: "price_desc", label: "Price · high" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

export function CatalogClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const paramsRecord = useMemo(
    () => ({ page, search, category, sort }),
    [page, search, category, sort],
  );

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === "") {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      });
      if (!updates.page) {
        next.delete("page");
      }
      router.push(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const res = await apiClient.get<{ data: { categories: Category[] } }>(
        "/categories",
      );
      return res.data.data.categories;
    },
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products(paramsRecord),
    queryFn: async () => {
      const qs = new URLSearchParams();
      qs.set("page", page);
      qs.set("limit", "12");
      if (search) qs.set("search", search);
      if (category) qs.set("category", category);
      if (sort) qs.set("sort", sort);
      const res = await apiClient.get<{ data: ListResponse }>(
        `/products?${qs.toString()}`,
      );
      return res.data.data;
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-10 md:py-14">
      <section className="animate-fade-up relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 p-8 shadow-lg shadow-blue-900/10 ring-1 ring-blue-500/10 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/40 dark:shadow-black/40 dark:ring-blue-500/20 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Storefront
          </p>
          <h1 className="mt-2 max-w-xl text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
            Find products you love
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
            Search, filter by category, and sort — cards lift on hover so browsing
            feels quick and responsive.
          </p>
        </div>
      </section>

      <Card className="animate-fade-up-delay-1 grid gap-5 md:grid-cols-4">
        <div className="md:col-span-4 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Filters
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Refine results — updates apply to the grid below.
          </p>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="search">Search</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="search"
              name="search"
              placeholder="Name, SKU, description…"
              defaultValue={search}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setParams({
                    search: (e.target as HTMLInputElement).value,
                    page: "1",
                  });
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const el = document.getElementById("search") as HTMLInputElement;
                setParams({ search: el?.value ?? "", page: "1" });
              }}
            >
              Go
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            className="mt-1"
            value={category}
            onChange={(e) =>
              setParams({ category: e.target.value, page: "1" })
            }
          >
            <option value="">All</option>
            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="sort">Sort</Label>
          <Select
            id="sort"
            className="mt-1"
            value={sort}
            onChange={(e) => setParams({ sort: e.target.value, page: "1" })}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {productsQuery.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : productsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {getErrorMessage(productsQuery.error, "Could not load products.")}
        </div>
      ) : (
        <>
          <div className="animate-fade-up-delay-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(productsQuery.data?.products ?? []).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {productsQuery.data?.products?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/40">
              <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                No matches yet
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Try clearing search or picking “All” categories.
              </p>
            </div>
          )}
          {productsQuery.data?.pagination && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Page {productsQuery.data.pagination.page} of{" "}
                {productsQuery.data.pagination.totalPages} ·{" "}
                {productsQuery.data.pagination.total} items
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!productsQuery.data.pagination.hasPrevPage}
                  onClick={() =>
                    setParams({
                      page: String(
                        Math.max(1, productsQuery.data!.pagination.page - 1),
                      ),
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!productsQuery.data.pagination.hasNextPage}
                  onClick={() =>
                    setParams({
                      page: String(
                        productsQuery.data!.pagination.page + 1,
                      ),
                    })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
