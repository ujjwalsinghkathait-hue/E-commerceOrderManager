"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Analytics } from "@/types/domain";

export default function AdminDashboardPage() {
  const query = useQuery({
    queryKey: queryKeys.adminAnalytics,
    queryFn: async () => {
      const res = await apiClient.get<{ data: Analytics }>("/admin/analytics");
      return res.data.data;
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
        {getErrorMessage(query.error, "Could not load analytics.")}
      </p>
    );
  }

  const a = query.data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Snapshot of orders and revenue (delivered orders).
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-zinc-500">Total orders</p>
          <p className="mt-2 text-2xl font-semibold">{a.totalOrders}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-zinc-500">Pending orders</p>
          <p className="mt-2 text-2xl font-semibold">{a.pendingOrders}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-zinc-500">Revenue (delivered)</p>
          <p className="mt-2 text-2xl font-semibold">
            ${a.totalRevenue.toFixed(2)}
          </p>
        </Card>
      </div>
    </div>
  );
}
