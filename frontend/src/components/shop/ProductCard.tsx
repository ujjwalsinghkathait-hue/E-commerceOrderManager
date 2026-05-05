import Link from "next/link";
import type { Product } from "@/types/domain";
import { ProductImage } from "@/components/media/ProductImage";
import { ProductQuickAdd } from "@/components/shop/ProductQuickAdd";

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
  const inStock = product.stock > 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-1 hover:border-blue-200/80 hover:shadow-xl hover:shadow-blue-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.06] dark:hover:border-blue-500/30 dark:hover:shadow-blue-950/30">
      <Link
        href={href}
        className="flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
          {image ? (
            <ProductImage
              src={image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-zinc-400">
              <span className="text-2xl opacity-40">◇</span>
              <span>No image</span>
            </div>
          )}
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-md ${
              inStock
                ? "bg-emerald-500/90 text-white"
                : "bg-rose-500/90 text-white"
            }`}
          >
            {inStock ? "In stock" : "Sold out"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {getCategoryName(product)}
          </p>
          <h2 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-zinc-900 transition group-hover:text-blue-700 dark:text-zinc-50 dark:group-hover:text-blue-300">
            {product.name}
          </h2>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              ${product.price.toFixed(2)}
            </p>
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {inStock ? `${product.stock} left` : "—"}
            </span>
          </div>
        </div>
      </Link>
      <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
        <ProductQuickAdd product={product} />
      </div>
    </article>
  );
}
