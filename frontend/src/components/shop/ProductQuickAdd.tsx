"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartLine } from "@/lib/cart/guestCartStorage";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/domain";

type ProductQuickAddProps = { product: Product };

export function ProductQuickAdd({ product }: ProductQuickAddProps) {
  const { user, ready } = useAuth();
  const qc = useQueryClient();
  const inStock = product.stock > 0;

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/cart/items", {
        product: product._id,
        quantity: 1,
      });
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });

  if (!ready) {
    return (
      <div
        className="h-10 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
        aria-hidden
      />
    );
  }

  const onAdd = () => {
    if (user) {
      addMutation.mutate();
    } else {
      addGuestCartLine(product._id, 1, product.stock);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      disabled={!inStock || (Boolean(user) && addMutation.isPending)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdd();
      }}
    >
      {user && addMutation.isPending
        ? "Adding…"
        : inStock
          ? "Add to cart"
          : "Out of stock"}
    </Button>
  );
}
