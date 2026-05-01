"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { ProductCard } from "@/components/shop/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Catalog
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Browse products with search, category, and sorting.
        </p>
      </div>

      <Card className="grid gap-4 md:grid-cols-4">
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
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : productsQuery.isError ? (
        <p className="text-sm text-red-600">
          {getErrorMessage(productsQuery.error, "Could not load products.")}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(productsQuery.data?.products ?? []).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          {productsQuery.data?.products?.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-500">
              No products match your filters.
            </p>
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
