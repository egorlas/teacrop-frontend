"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { formatCurrencyVND } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/lib/image-utils";

type ProductCardProps = {
  product: Product;
  className?: string;
};

/** Sinh số lượt bán giả (ổn định theo product.id) */
function fakeSoldCount(id: number | string): string {
  const n = typeof id === "string" ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : id;
  const variants = [
    "1.2k",
    "3.5k",
    "50k+",
    "80k+",
    "120",
    "2.1k",
    "15k+",
    "200k+",
    "60k+",
    "100k+",
  ];
  const idx = Math.abs(n) % variants.length;
  return variants[idx];
}

export function ProductCard({ product, className }: ProductCardProps) {
  const productHref = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
  const soldText = fakeSoldCount(product.id);

  return (
    <Link
      href={productHref}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <ProductImage
          src={product.image ?? ""}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      {/* Hover zoom overlay - detached from card (fixed on viewport) */}
      <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-black/10 backdrop-blur-[1px] group-hover:flex">
        <div className="relative aspect-square w-[150%] max-w-[420px] sm:max-w-[480px]">
          <ProductImage
            src={product.image ?? ""}
            alt={product.name}
            fill
            className="object-contain"
            sizes="320px"
            loading="lazy"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary line-clamp-2">
          {product.name}
        </h3>
        {product.note && (
          <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{product.note}</p>
        )}
        <div className="mt-auto space-y-1">
          <span className="text-lg font-bold text-primary">
            {formatCurrencyVND(product.price)}
          </span>
          <p className="text-xs text-muted-foreground">Đã bán {soldText}</p>
        </div>
      </div>
    </Link>
  );
}
