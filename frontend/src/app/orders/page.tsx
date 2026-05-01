"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Order } from "@/types/domain";
import { useState } from "react";

export default function OrdersPage() {
  const { user, ready } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  const query = useQuery({
    queryKey: queryKeys.myOrders(page, limit),
    queryFn: async () => {
      const res = await apiClient.get<{
        data: { orders: Order[]; pagination: { totalPages: number } };
      }>(`/orders/my?page=${page}&limit=${limit}`);
      return res.data.data;
    },
    enabled: ready && Boolean(user),
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
        <h1 className="text-xl font-semibold">My orders</h1>
        <p className="mt-2 text-sm text-zinc-600">
          <Link href="/login" className="underline">
            Sign in
          </Link>{" "}
          to see your orders.
        </p>
      </main>
    );
  }

  if (query.isLoading) {
    return (
      <div className="flex flex-1 justify-center py-24">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-4 py-16 text-sm text-red-600">
        {getErrorMessage(query.error)}
      </main>
    );
  }

  const orders = query.data?.orders ?? [];
  const totalPages = query.data?.pagination?.totalPages ?? 1;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">My orders</h1>
      {orders.length === 0 ? (
        <Card className="text-center text-sm text-zinc-600">
          No orders yet.
          <Link href="/" className="mt-2 block font-medium underline">
            Shop now
          </Link>
        </Card>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o._id}>
              <Link href={`/orders/${o._id}`}>
                <Card className="transition hover:border-zinc-300 dark:hover:border-zinc-600">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-xs text-zinc-500">
                        {o.orderStatus} · {o.paymentStatus}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ${o.total.toFixed(2)}
                    </p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}
