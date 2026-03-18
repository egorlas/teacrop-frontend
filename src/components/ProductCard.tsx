"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/lib/image-utils";

type ProductCardProps = {
  product: Product;
  className?: string;
};

function formatCurrencyVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPriceRange(priceRange?: string): string | null {
  if (!priceRange) return null;
  const parts = priceRange.split("-").map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 2) return null;
  const low = Number(parts[0]);
  const high = Number(parts[1]);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return null;
  if (low === high) return formatCurrencyVND(low);
  return `${formatCurrencyVND(low)} - ${formatCurrencyVND(high)}`;
}

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
  const priceRangeText = formatPriceRange(product.price_range);

  return (
    <Link
      href={productHref}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <ProductImage
          src={product.image ?? ""}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-200 hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-semibold text-card-foreground line-clamp-2 transition-colors hover:text-primary">
          {product.name}
        </h3>
        {priceRangeText && (
          <p className="mb-2 text-sm font-semibold text-rose-600">
            {priceRangeText}
          </p>
        )}
        {product.note && (
          <p className="mb-3 line-clamp-2 flex-1 text-sm text-muted-foreground">{product.note}</p>
        )}
        <div className="mt-auto space-y-1">
          {product.attributes?.origin && (
            <p className="text-xs text-muted-foreground">
              Xuất xứ: {product.attributes.origin}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Đã bán {soldText}</p>
        </div>
      </div>
    </Link>
  );
}
