"use client";

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { fetchCart } from "@/lib/api/cart";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCartLines } from "@/lib/cart/useGuestCart";
import {
  clearGuestCart,
  removeGuestCartLine,
  updateGuestCartQuantity,
} from "@/lib/cart/guestCartStorage";
import { getSafeNextPath } from "@/lib/auth/safeNextPath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { CartLine, Product } from "@/types/domain";

function lineProduct(line: CartLine): Product {
  if (line.product && typeof line.product === "object") {
    return line.product;
  }
  throw new Error("Cart line missing product");
}

export default function CartPage() {
  const { user, ready } = useAuth();
  const qc = useQueryClient();
  const guestLines = useGuestCartLines();

  const cartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: fetchCart,
    enabled: ready && Boolean(user),
  });

  const productQueries = useQueries({
    queries: guestLines.map((line) => ({
      queryKey: queryKeys.product(line.productId),
      queryFn: async () => {
        const res = await apiClient.get<{ data: { product: Product } }>(
          `/products/${line.productId}`,
        );
        return res.data.data.product;
      },
      enabled: ready && !user && guestLines.length > 0,
    })),
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
    const loginHref = `/login?next=${encodeURIComponent(getSafeNextPath("/cart"))}`;

    if (guestLines.length === 0) {
      return (
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
          <h1 className="text-2xl font-semibold">Cart</h1>
          <Card className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>Your cart is empty.</p>
            <p className="mt-2 text-xs text-zinc-500">
              Browse as a guest — items stay on this device until you{" "}
              <Link href={loginHref} className="font-medium underline">
                sign in
              </Link>{" "}
              to sync them to your account.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              Continue shopping
            </Link>
          </Card>
        </main>
      );
    }

    const guestLoading = productQueries.some((q) => q.isLoading);
    if (guestLoading) {
      return (
        <div className="flex flex-1 justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      );
    }

    const rows = guestLines.map((line, i) => {
      const pq = productQueries[i];
      const p = pq?.data;
      return { line, product: p, query: pq };
    });

    const subtotal = rows.reduce((acc, { line, product: p }) => {
      if (!p) {
        return acc;
      }
      return acc + p.price * line.quantity;
    }, 0);

    return (
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Cart</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Guest cart · saved on this device ·{" "}
              <Link href={loginHref} className="font-medium underline">
                Sign in
              </Link>{" "}
              to merge with your account
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={() => clearGuestCart()}>
            Clear
          </Button>
        </div>

        <ul className="space-y-3">
          {rows.map(({ line, product: p, query }) => (
            <li key={line.productId}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {p ? (
                    <>
                      <Link
                        href={`/products/${p._id}`}
                        className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        ${p.price.toFixed(2)} each · SKU {p.sku}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">
                        Product unavailable
                      </p>
                      <p className="text-xs text-zinc-500">
                        {query?.isError
                          ? "Could not load this item."
                          : "This product may have been removed."}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {p && (
                    <Input
                      key={`${p._id}-${line.quantity}`}
                      type="number"
                      min={1}
                      max={Math.max(1, p.stock)}
                      className="w-20"
                      defaultValue={line.quantity}
                      onBlur={(e) => {
                        const n = Math.max(1, Number(e.target.value) || 1);
                        const capped = Math.min(n, Math.max(1, p.stock));
                        if (capped !== line.quantity) {
                          updateGuestCartQuantity(
                            line.productId,
                            capped,
                            p.stock,
                          );
                        }
                      }}
                    />
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeGuestCartLine(line.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Subtotal</p>
            <p className="text-xl font-semibold">${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href={`/login?next=${encodeURIComponent("/checkout")}`}>
              <Button type="button" className="w-full sm:w-auto">
                Sign in to checkout
              </Button>
            </Link>
            <p className="text-xs text-zinc-500">
              Checkout requires an account so we can fulfill your order.
            </p>
          </div>
        </Card>
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
