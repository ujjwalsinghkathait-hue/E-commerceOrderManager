"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchCart } from "@/lib/api/cart";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { CartLine, Order, Product } from "@/types/domain";

const PAYMENT_METHODS = [
  { value: "card", label: "Card" },
  { value: "cod", label: "Cash on delivery" },
  { value: "paypal", label: "PayPal" },
  { value: "bank_transfer", label: "Bank transfer" },
];

function lineProduct(line: CartLine): Product {
  if (line.product && typeof line.product === "object") {
    return line.product;
  }
  throw new Error("Cart line missing product");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const cartQuery = useQuery({
    queryKey: queryKeys.cart,
    queryFn: fetchCart,
    enabled: ready && Boolean(user),
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<{ data: { order: Order } }>("/orders", {
        paymentMethod,
        shippingAddress: {
          fullName,
          line1,
          line2,
          city,
          state,
          postalCode,
          country,
          phone,
        },
      });
      return res.data.data.order;
    },
    onSuccess: (order) => {
      void qc.invalidateQueries({ queryKey: queryKeys.cart });
      router.push(`/orders/${order._id}`);
    },
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
        <h1 className="text-xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/login?next=%2Fcheckout"
            className="font-medium underline"
          >
            Sign in
          </Link>{" "}
          to place an order. If you shopped as a guest, your cart merges when
          you sign in.
        </p>
        <Link
          href="/cart"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          View cart
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

  const items = cartQuery.data?.cart.items ?? [];
  const subtotal = cartQuery.data?.summary.subtotal ?? 0;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium underline">
          Browse catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-4xl flex-1 gap-8 px-4 py-10 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <Card className="space-y-3 text-sm">
          {items.map((line) => {
            const p = lineProduct(line);
            return (
              <div
                key={p._id}
                className="flex justify-between border-b border-zinc-100 pb-2 last:border-0 dark:border-zinc-800"
              >
                <span>
                  {p.name} × {line.quantity}
                </span>
                <span>${(p.price * line.quantity).toFixed(2)}</span>
              </div>
            );
          })}
          <div className="flex justify-between pt-2 font-semibold">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping</h2>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            className="mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="line1">Address line 1</Label>
          <Input
            id="line1"
            className="mt-1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="line2">Address line 2</Label>
          <Input
            id="line2"
            className="mt-1"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              className="mt-1"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State / region</Label>
            <Input
              id="state"
              className="mt-1"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="postal">Postal code</Label>
            <Input
              id="postal"
              className="mt-1"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              className="mt-1"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            className="mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pay">Payment method</Label>
          <Select
            id="pay"
            className="mt-1"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
        {orderMutation.isError && (
          <p className="text-sm text-red-600">
            {getErrorMessage(orderMutation.error)}
          </p>
        )}
        <Button
          type="button"
          className="w-full"
          disabled={orderMutation.isPending}
          onClick={() => orderMutation.mutate()}
        >
          {orderMutation.isPending ? "Placing order…" : "Place order"}
        </Button>
      </Card>
    </main>
  );
}
