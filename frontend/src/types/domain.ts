export type UserRole = "customer" | "admin";

export type User = {
  /** Present on auth payloads (`toSafeObject`). */
  id?: string;
  /** Present on MongoDB `lean()` documents. */
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Category | string;
  images: string[];
  sku: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export type Cart = {
  _id: string;
  user: string;
  items: CartLine[];
  createdAt?: string;
  updatedAt?: string;
};

export type CartSummary = {
  lineCount: number;
  unitCount: number;
  subtotal: number;
};

export type OrderItem = {
  product: string | Product;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Analytics = {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
};
