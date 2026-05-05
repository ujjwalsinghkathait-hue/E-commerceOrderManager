"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getGuestCartSnapshot,
  getServerGuestCartSnapshot,
  guestCartUnitCount,
  subscribeGuestCart,
  type GuestCartLine,
} from "@/lib/cart/guestCartStorage";

export function useGuestCartLines(): GuestCartLine[] {
  return useSyncExternalStore(
    subscribeGuestCart,
    getGuestCartSnapshot,
    getServerGuestCartSnapshot,
  );
}

export function useGuestCartUnitCount(): number {
  const lines = useGuestCartLines();
  return useMemo(() => guestCartUnitCount(lines), [lines]);
}
