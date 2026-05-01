"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Order } from "@/types/domain";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, ready } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.myOrder(id),
    queryFn: async () => {
      const res = await apiClient.get<{ data: { order: Order } }>(
        `/orders/my/${id}`,
      );
      return res.data.data.order;
    },
    enabled: ready && Boolean(user) && Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/orders/my/${id}/cancel`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.myOrder(id) });
      void qc.invalidateQueries({ queryKey: ["orders", "my"] });
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
    router.replace("/login");
    return null;
  }

  if (query.isLoading) {
    return (
      <div className="flex flex-1 justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 text-sm text-red-600">
        {getErrorMessage(query.error, "Order not found.")}
      </main>
    );
  }

  const o = query.data;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{o.orderNumber}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {o.orderStatus} · Payment: {o.paymentStatus}
          </p>
        </div>
        <Link
          href="/orders"
          className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
        >
          ← All orders
        </Link>
      </div>

      <Card className="space-y-2 text-sm">
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

      <Card className="space-y-1 text-sm">
        <p className="font-medium">Shipping</p>
        <p>{o.shippingAddress.fullName}</p>
        <p>
          {o.shippingAddress.line1}
          {o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}
        </p>
        <p>
          {o.shippingAddress.city}
          {o.shippingAddress.state ? `, ${o.shippingAddress.state}` : ""}{" "}
          {o.shippingAddress.postalCode}
        </p>
        <p>{o.shippingAddress.country}</p>
        {o.shippingAddress.phone ? <p>{o.shippingAddress.phone}</p> : null}
      </Card>

      <p className="text-sm text-zinc-600">
        Payment method: <span className="font-medium">{o.paymentMethod}</span>
      </p>

      {o.orderStatus === "pending" && (
        <div>
          <Button
            type="button"
            variant="danger"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending ? "Cancelling…" : "Cancel order"}
          </Button>
          {cancelMutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {getErrorMessage(cancelMutation.error)}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
