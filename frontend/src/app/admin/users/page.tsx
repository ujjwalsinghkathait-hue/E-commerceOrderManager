"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/types/domain";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const limit = 20;

  const query = useQuery({
    queryKey: queryKeys.adminUsers(page, limit, applied),
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (applied) qs.set("search", applied);
      const res = await apiClient.get<{
        data: { users: User[]; pagination: { totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } };
      }>(`/admin/users?${qs.toString()}`);
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
        {getErrorMessage(query.error, "Could not load users.")}
      </p>
    );
  }

  const users = query.data?.users ?? [];
  const pagination = query.data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Search by name or email.
        </p>
      </div>

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            className="mt-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or email"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setApplied(search.trim());
            setPage(1);
          }}
        >
          Apply
        </Button>
      </Card>

      <div className="space-y-2">
        {users.map((u) => (
          <Card
            key={u.id ?? u._id ?? u.email}
            className="flex flex-wrap justify-between gap-2 p-3 text-sm"
          >
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-zinc-500">{u.email}</p>
            </div>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs capitalize dark:bg-zinc-900">
              {u.role}
            </span>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-sm text-zinc-500">No users found.</p>
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
