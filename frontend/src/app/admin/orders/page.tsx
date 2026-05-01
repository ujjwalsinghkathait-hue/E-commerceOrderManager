"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Order, User } from "@/types/domain";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

function userEmail(order: Order): string {
  if (order.user && typeof order.user === "object") {
    return (order.user as User).email;
  }
  return "—";
}

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const limit = 15;

  const paramsStr = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("limit", String(limit));
    if (orderStatus) qs.set("orderStatus", orderStatus);
    if (paymentStatus) qs.set("paymentStatus", paymentStatus);
    return qs.toString();
  }, [page, limit, orderStatus, paymentStatus]);

  const query = useQuery({
    queryKey: queryKeys.adminOrders(page, limit, paramsStr),
    queryFn: async () => {
      const res = await apiClient.get<{
        data: {
          orders: Order[];
          pagination: { totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
        };
      }>(`/admin/orders?${paramsStr}`);
      return res.data.data;
    },
  });

  const patchMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: { orderStatus?: string; paymentStatus?: string };
    }) => {
      await apiClient.patch(`/admin/orders/${id}`, body);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      void qc.invalidateQueries({ queryKey: queryKeys.adminAnalytics });
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <p className="text-sm text-red-600">
        {getErrorMessage(query.error, "Could not load orders.")}
      </p>
    );
  }

  const orders = query.data?.orders ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Filter and update fulfillment or payment status.
        </p>
      </div>

      <Card className="flex flex-wrap gap-4 p-4">
        <div>
          <Label htmlFor="os">Order status</Label>
          <Select
            id="os"
            className="mt-1 min-w-[160px]"
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ps">Payment status</Label>
          <Select
            id="ps"
            className="mt-1 min-w-[160px]"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="space-y-4">
        {orders.map((o) => (
          <Card key={o._id} className="space-y-3 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/admin/orders/${o._id}`}
                  className="font-medium hover:underline"
                >
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-zinc-500">{userEmail(o)}</p>
                <p className="text-xs text-zinc-500">
                  ${o.total.toFixed(2)} · {new Date(o.createdAt ?? "").toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <Label className="text-xs">Fulfillment</Label>
                <Select
                  className="mt-1 min-w-[140px]"
                  value={o.orderStatus}
                  onChange={(e) =>
                    patchMutation.mutate({
                      id: o._id,
                      body: { orderStatus: e.target.value },
                    })
                  }
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="text-xs">Payment</Label>
                <Select
                  className="mt-1 min-w-[140px]"
                  value={o.paymentStatus}
                  onChange={(e) =>
                    patchMutation.mutate({
                      id: o._id,
                      body: { paymentStatus: e.target.value },
                    })
                  }
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {patchMutation.isError && (
              <p className="text-xs text-red-600">
                {getErrorMessage(patchMutation.error)}
              </p>
            )}
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <p className="text-sm text-zinc-500">No orders match filters.</p>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
