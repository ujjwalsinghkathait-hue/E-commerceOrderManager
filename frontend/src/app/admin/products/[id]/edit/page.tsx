"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errorMessage";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import type { Category, Product } from "@/types/domain";

function parseImages(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function categoryId(p: Product): string {
  if (p.category && typeof p.category === "object") {
    return p.category._id;
  }
  return String(p.category ?? "");
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const qc = useQueryClient();

  const productQuery = useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const res = await apiClient.get<{ data: { product: Product } }>(
        `/products/${id}`,
      );
      return res.data.data.product;
    },
    enabled: Boolean(id),
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const res = await apiClient.get<{ data: { categories: Category[] } }>(
        "/categories",
      );
      return res.data.data.categories;
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [imagesRaw, setImagesRaw] = useState("");

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data;
      setName(p.name);
      setDescription(p.description ?? "");
      setPrice(String(p.price));
      setStock(String(p.stock));
      setCategory(categoryId(p));
      setSku(p.sku);
      setImagesRaw((p.images ?? []).join("\n"));
    }
  }, [productQuery.data]);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/products/${id}`, {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        sku,
        images: parseImages(imagesRaw),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: queryKeys.product(id) });
      router.push("/admin/products");
    },
  });

  const disabled = useMemo(
    () =>
      !name ||
      !sku ||
      !category ||
      Number.isNaN(Number(price)) ||
      Number.isNaN(Number(stock)),
    [name, sku, category, price, stock],
  );

  if (productQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <p className="text-sm text-red-600">
        {getErrorMessage(productQuery.error, "Product not found.")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Edit product</h1>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
        >
          Back
        </Link>
      </div>
      <Card className="space-y-4 p-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            className="mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min={0}
              className="mt-1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min={0}
              className="mt-1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="cat">Category</Label>
          <Select
            id="cat"
            className="mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {(categoriesQuery.data ?? []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            className="mt-1"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="images">Image URLs (comma or newline)</Label>
          <Textarea
            id="images"
            className="mt-1 min-h-24"
            value={imagesRaw}
            onChange={(e) => setImagesRaw(e.target.value)}
          />
        </div>
        {mutation.isError && (
          <p className="text-sm text-red-600">{getErrorMessage(mutation.error)}</p>
        )}
        <Button
          type="button"
          disabled={disabled || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </Card>
    </div>
  );
}
