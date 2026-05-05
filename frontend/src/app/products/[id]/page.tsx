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
import { ProductImage } from "@/components/media/ProductImage";
import { addGuestCartLine } from "@/lib/cart/guestCartStorage";
import { getSafeNextPath } from "@/lib/auth/safeNextPath";
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
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-4 py-10 md:grid-cols-2 md:gap-12 md:py-14">
      <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-xl shadow-zinc-900/10 ring-1 ring-black/[0.04] dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800 dark:shadow-black/40 dark:ring-white/[0.06]">
        {image ? (
          <div className="relative aspect-square w-full">
            <ProductImage
              src={image}
              alt={p.name}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 text-sm text-zinc-500">
            <span className="text-4xl opacity-30">◇</span>
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-5 animate-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          {categoryName}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
          {p.name}
        </h1>
        <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-white">
          ${p.price.toFixed(2)}
        </p>
        <p className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="font-medium">SKU</span> {p.sku} ·{" "}
          <span className="font-medium">Stock</span> {p.stock}
        </p>
        <Card>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
            {p.description || "No description provided."}
          </p>
        </Card>
        {ready && (
          <div className="flex flex-col gap-2">
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
                  onChange={(e) =>
                    setQty(
                      Math.min(
                        Math.max(1, Number(e.target.value) || 1),
                        Math.max(1, p.stock),
                      ),
                    )
                  }
                />
              </div>
              <Button
                type="button"
                disabled={
                  p.stock < 1 ||
                  (Boolean(user) && addMutation.isPending)
                }
                onClick={() => {
                  if (user) {
                    addMutation.mutate();
                  } else {
                    addGuestCartLine(p._id, qty, p.stock);
                  }
                }}
              >
                {user && addMutation.isPending ? "Adding…" : "Add to cart"}
              </Button>
              {user && addMutation.isError && (
                <p className="text-sm text-red-600">
                  {getErrorMessage(addMutation.error)}
                </p>
              )}
            </div>
            {!user && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Saved on this device until you{" "}
                <Link
                  href={`/login?next=${encodeURIComponent(
                    getSafeNextPath(`/products/${id}`),
                  )}`}
                  className="font-medium underline"
                >
                  sign in
                </Link>{" "}
                (we merge your guest cart into your account).
              </p>
            )}
          </div>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to catalog
        </Link>
      </div>
    </main>
  );
}
