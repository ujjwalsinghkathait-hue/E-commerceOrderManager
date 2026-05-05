import { apiClient } from "@/lib/api/client";
import {
  clearGuestCart,
  getGuestCartSnapshot,
  setGuestCartLines,
  type GuestCartLine,
} from "@/lib/cart/guestCartStorage";

/**
 * Pushes each guest line to the authenticated user's server cart.
 * Lines that fail (e.g. product removed, stock) stay in guest storage.
 */
export async function mergeGuestCartIntoServer(): Promise<void> {
  const lines = getGuestCartSnapshot();
  if (lines.length === 0) {
    return;
  }

  const remaining: GuestCartLine[] = [];

  for (const line of lines) {
    try {
      await apiClient.post("/cart/items", {
        product: line.productId,
        quantity: line.quantity,
      });
    } catch {
      remaining.push(line);
    }
  }

  if (remaining.length === 0) {
    clearGuestCart();
  } else {
    setGuestCartLines(remaining);
  }
}
