"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Product } from "@/types/domain";

export default function AdminProductsPage() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.products({ page: "1", limit: "100", search: "", category: "", sort: "newest" }),
    queryFn: async () => {
      const res = await apiClient.get<{
        data: { products: Product[]; pagination: { total: number } };
      }>("/products?page=1&limit=100&sort=newest");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <p className="text-sm text-red-600">
        {getErrorMessage(query.error, "Could not load products.")}
      </p>
    );
  }

  const products = query.data?.products ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {products.length} loaded · CRUD uses the same catalog API.
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button type="button">New product</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {products.map((p) => (
          <Card key={p._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-zinc-500">
                SKU {p.sku} · ${p.price.toFixed(2)} · stock {p.stock}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${p._id}/edit`}>
                <Button type="button" variant="secondary">
                  Edit
                </Button>
              </Link>
              <Button
                type="button"
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(`Delete ${p.name}?`)
                  ) {
                    deleteMutation.mutate(p._id);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
