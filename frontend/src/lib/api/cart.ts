import { apiClient } from "@/lib/api/client";
import type { Cart, CartSummary } from "@/types/domain";

export type CartApiData = {
  cart: Cart;
  summary: CartSummary;
};

/**
 * Shared fetch for `queryKeys.cart` so every observer stores the same shape.
 * (Mixing queryFns for the same key — e.g. returning only `unitCount` — corrupts the cache.)
 */
export async function fetchCart(): Promise<CartApiData> {
  const res = await apiClient.get<{ data: CartApiData }>("/cart");
  return res.data.data;
}
