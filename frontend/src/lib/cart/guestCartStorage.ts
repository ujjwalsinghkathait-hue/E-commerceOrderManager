const STORAGE_KEY = "ecommerce_guest_cart_v1";

export type GuestCartLine = {
  productId: string;
  quantity: number;
};

/** Stable empty snapshot for `useSyncExternalStore` + parse fallbacks. */
export const EMPTY_GUEST_CART_LINES: GuestCartLine[] = [];

const listeners = new Set<() => void>();

/** Matches last `localStorage.getItem` result so snapshots stay referentially stable. */
let cachedStorageRaw: string | null | undefined = undefined;
let cachedSnapshotLines: GuestCartLine[] = EMPTY_GUEST_CART_LINES;

export function subscribeGuestCart(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const l of listeners) {
    l();
  }
}

function parse(raw: string | null): GuestCartLine[] {
  if (!raw) {
    return EMPTY_GUEST_CART_LINES;
  }
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) {
      return EMPTY_GUEST_CART_LINES;
    }
    const rows = data
      .filter(
        (row): row is GuestCartLine =>
          Boolean(row) &&
          typeof row === "object" &&
          typeof (row as GuestCartLine).productId === "string" &&
          typeof (row as GuestCartLine).quantity === "number",
      )
      .map((row) => ({
        productId: row.productId,
        quantity: Math.min(999, Math.max(1, Math.floor(row.quantity))),
      }));
    return rows.length === 0 ? EMPTY_GUEST_CART_LINES : rows;
  } catch {
    return EMPTY_GUEST_CART_LINES;
  }
}

/**
 * Server/hydration snapshot — must always return the same reference (React 19).
 */
export function getServerGuestCartSnapshot(): GuestCartLine[] {
  return EMPTY_GUEST_CART_LINES;
}

export function getGuestCartSnapshot(): GuestCartLine[] {
  if (typeof window === "undefined") {
    return EMPTY_GUEST_CART_LINES;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedStorageRaw) {
    return cachedSnapshotLines;
  }
  cachedStorageRaw = raw;
  cachedSnapshotLines = parse(raw);
  return cachedSnapshotLines;
}

export function setGuestCartLines(lines: GuestCartLine[]) {
  if (typeof window === "undefined") {
    return;
  }
  const json = JSON.stringify(lines);
  localStorage.setItem(STORAGE_KEY, json);
  cachedStorageRaw = json;
  cachedSnapshotLines =
    lines.length === 0
      ? EMPTY_GUEST_CART_LINES
      : lines.map((l) => ({ productId: l.productId, quantity: l.quantity }));
  emit();
}

export function clearGuestCart() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  cachedStorageRaw = null;
  cachedSnapshotLines = EMPTY_GUEST_CART_LINES;
  emit();
}

export function guestCartUnitCount(lines: GuestCartLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}

export function addGuestCartLine(
  productId: string,
  quantity: number,
  maxStock: number,
) {
  if (maxStock < 1 || quantity < 1) {
    return;
  }
  const lines = getGuestCartSnapshot();
  const idx = lines.findIndex((l) => l.productId === productId);
  const current = idx >= 0 ? lines[idx].quantity : 0;
  const nextQty = Math.min(current + quantity, maxStock);
  if (nextQty < 1) {
    return;
  }
  const next =
    idx >= 0
      ? lines.map((l, i) => (i === idx ? { ...l, quantity: nextQty } : l))
      : [
          ...lines,
          {
            productId,
            quantity: Math.min(quantity, maxStock),
          },
        ];
  setGuestCartLines(next);
}

export function updateGuestCartQuantity(
  productId: string,
  quantity: number,
  maxStock: number,
) {
  const q = Math.min(Math.max(1, Math.floor(quantity)), maxStock);
  const next = getGuestCartSnapshot()
    .map((l) => (l.productId === productId ? { ...l, quantity: q } : l))
    .filter((l) => l.quantity > 0);
  setGuestCartLines(next);
}

export function removeGuestCartLine(productId: string) {
  setGuestCartLines(
    getGuestCartSnapshot().filter((l) => l.productId !== productId),
  );
}
