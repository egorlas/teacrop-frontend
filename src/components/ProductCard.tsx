"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { formatCurrencyVND } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  // Use slug for URL if available (better SEO), fallback to id
  const productHref = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if product is out of stock
    if (product.inventory !== undefined && product.inventory === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
    
    toast.success("Đã thêm vào giỏ hàng", {
      description: product.name,
      duration: 2000,
    });
  };
  
  const isOutOfStock = product.inventory !== undefined && product.inventory === 0;
  
  return (
    <Link
      href={productHref}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-md",
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
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary line-clamp-2">
          {product.name}
        </h3>
        {product.note && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">{product.note}</p>
        )}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-card-foreground">
              {formatCurrencyVND(product.price)}
            </span>
            {product.inventory !== undefined && product.inventory <= 5 && product.inventory > 0 && (
              <span className="text-xs text-orange-500 font-medium">
                Còn {product.inventory} sản phẩm
              </span>
            )}
            {isOutOfStock && (
              <span className="text-xs text-destructive font-medium">Hết hàng</span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="sm"
            className="w-full"
            variant={isOutOfStock ? "secondary" : "default"}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
          </Button>
        </div>
      </div>
    </Link>
  );
}

