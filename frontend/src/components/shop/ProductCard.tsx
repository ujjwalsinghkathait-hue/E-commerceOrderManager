import Link from "next/link";
import type { Product } from "@/types/domain";

type ProductCardProps = { product: Product };

function getCategoryName(product: Product) {
  if (product.category && typeof product.category === "object") {
    return product.category.name;
  }
  return "—";
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const href = `/products/${product._id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {getCategoryName(product)}
        </p>
        <h2 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:underline dark:text-zinc-50">
          {product.name}
        </h2>
        <p className="mt-auto pt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          ${product.price.toFixed(2)}
        </p>
        <p className="text-xs text-zinc-500">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}
