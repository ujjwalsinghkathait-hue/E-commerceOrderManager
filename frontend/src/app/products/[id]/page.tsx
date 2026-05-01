"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import type { Product } from "@/types/domain";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, ready } = useAuth();
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);

  const query = useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const res = await apiClient.get<{ data: { product: Product } }>(
        `/products/${id}`,
      );
      return res.data.data.product;
    },
    enabled: Boolean(id),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/cart/items", { product: id, quantity: qty });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-1 justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-3xl flex-1 px-4 py-16 text-sm text-red-600">
        {getErrorMessage(query.error, "Product not found.")}
      </div>
    );
  }

  const p = query.data;
  const image = p.images?.[0];
  const categoryName =
    p.category && typeof p.category === "object" ? p.category.name : "—";

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-10 md:grid-cols-2">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={p.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-zinc-500">
            No image
          </div>
        )}
      </div>
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {categoryName}
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {p.name}
        </h1>
        <p className="text-2xl font-bold">${p.price.toFixed(2)}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          SKU: {p.sku} · Stock: {p.stock}
        </p>
        <Card>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
            {p.description || "No description provided."}
          </p>
        </Card>
        {ready && user ? (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="qty"
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Qty
              </label>
              <Input
                id="qty"
                type="number"
                min={1}
                max={Math.max(1, p.stock)}
                className="mt-1 w-24"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <Button
              type="button"
              disabled={p.stock < 1 || addMutation.isPending}
              onClick={() => addMutation.mutate()}
            >
              {addMutation.isPending ? "Adding…" : "Add to cart"}
            </Button>
            {addMutation.isError && (
              <p className="text-sm text-red-600">
                {getErrorMessage(addMutation.error)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>{" "}
            to add this product to your cart.
          </p>
        )}
        <Link
          href="/"
          className="inline-block text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
        >
          ← Back to catalog
        </Link>
      </div>
    </main>
  );
}
