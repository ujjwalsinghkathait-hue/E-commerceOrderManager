export const queryKeys = {
  me: ["auth", "me"] as const,
  products: (params: Record<string, string | undefined>) =>
    ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  categories: ["categories"] as const,
  cart: ["cart"] as const,
  myOrders: (page: number, limit: number) =>
    ["orders", "my", page, limit] as const,
  myOrder: (id: string) => ["orders", "my", id] as const,
  adminAnalytics: ["admin", "analytics"] as const,
  adminUsers: (page: number, limit: number, search?: string) =>
    ["admin", "users", page, limit, search ?? ""] as const,
  adminOrders: (page: number, limit: number, params: string) =>
    ["admin", "orders", page, limit, params] as const,
};
