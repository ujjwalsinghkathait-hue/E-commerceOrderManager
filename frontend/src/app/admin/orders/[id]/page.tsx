"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Order, User } from "@/types/domain";

function userLabel(order: Order): string {
  if (order.user && typeof order.user === "object") {
    const u = order.user as User;
    return `${u.name} · ${u.email}`;
  }
  return "—";
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const query = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { order: Order } }>(
        `/admin/orders/${id}`,
      );
      return res.data.data.order;
    },
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p className="text-sm text-red-600">
        {getErrorMessage(query.error, "Order not found.")}
      </p>
    );
  }

  const o = query.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{o.orderNumber}</h1>
          <p className="text-sm text-zinc-600">{userLabel(o)}</p>
          <p className="text-sm text-zinc-600">
            {o.orderStatus} · Payment: {o.paymentStatus}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-zinc-600 underline"
        >
          ← Orders
        </Link>
      </div>

      <Card className="space-y-2 p-4 text-sm">
        <p className="font-medium">Items</p>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {o.items.map((item, idx) => (
            <li key={`${item.sku}-${idx}`} className="flex justify-between py-2">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold dark:border-zinc-800">
          <span>Total</span>
          <span>${o.total.toFixed(2)}</span>
        </div>
      </Card>

      <Card className="space-y-1 p-4 text-sm">
        <p className="font-medium">Shipping</p>
        <p>{o.shippingAddress.fullName}</p>
        <p>
          {o.shippingAddress.line1}
          {o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}
        </p>
        <p>
          {o.shippingAddress.city}{" "}
          {o.shippingAddress.postalCode}, {o.shippingAddress.country}
        </p>
      </Card>
    </div>
  );
}
