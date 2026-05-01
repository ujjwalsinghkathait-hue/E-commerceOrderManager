"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Cart, CartLine, Product } from "@/types/domain";

type CartResponse = { cart: Cart; summary: { subtotal: number; unitCount: number } };

function lineProduct(line: CartLine): Product {
  if (line.product && typeof line.product === "object") {
    return line.product;
  }
  throw new Error("Cart line missing product");
}

export default function CartPage() {
  const { user, ready } = useAuth();
  const qc = useQueryClient();

  const cartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: async () => {
      const res = await apiClient.get<{ data: CartResponse }>("/cart");
      return res.data.data;
    },
    enabled: ready && Boolean(user),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiClient.patch(`/cart/items/${id}`, { quantity });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/cart/items/${id}`);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete("/cart");
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });

  if (!ready) {
    return (
      <div className="flex flex-1 justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Your cart</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Sign in to view and manage your saved cart.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (cartQuery.isLoading) {
    return (
      <div className="flex flex-1 justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 text-sm text-red-600">
        {getErrorMessage(cartQuery.error, "Could not load cart.")}
      </main>
    );
  }

  const items = cartQuery.data?.cart?.items ?? [];
  const subtotal = cartQuery.data?.summary?.subtotal ?? 0;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Cart</h1>
        {items.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
          >
            Clear
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>Your cart is empty.</p>
          <Link
            href="/"
            className="mt-3 inline-block font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Continue shopping
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((line) => {
            const p = lineProduct(line);
            return (
              <li key={p._id}>
                <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link
                      href={`/products/${p._id}`}
                      className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      ${p.price.toFixed(2)} each · SKU {p.sku}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      key={`${p._id}-${line.quantity}`}
                      type="number"
                      min={1}
                      className="w-20"
                      defaultValue={line.quantity}
                      onBlur={(e) => {
                        const n = Math.max(1, Number(e.target.value) || 1);
                        if (n !== line.quantity) {
                          updateMutation.mutate({ id: p._id, quantity: n });
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeMutation.mutate(p._id)}
                      disabled={removeMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Subtotal</p>
            <p className="text-xl font-semibold">${subtotal.toFixed(2)}</p>
          </div>
          <Link href="/checkout">
            <Button type="button">Checkout</Button>
          </Link>
        </Card>
      )}
    </main>
  );
}
