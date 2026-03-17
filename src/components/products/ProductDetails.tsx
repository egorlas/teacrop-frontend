"use client";

import type { Product } from "@/types/product";
import { formatCurrencyVND } from "@/lib/utils";
import { Star, CheckCircle2, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/lib/image-utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { useState } from "react";
import { CartModal } from "@/components/cart/CartModal";

type ProductDetailsProps = {
  product: Product;
};

// Helper functions to map enum values to Vietnamese labels
const getProductTypeLabel = (type?: string): string | null => {
  if (!type) return null;
  const labels: Record<string, string> = {
    tea: "Trà",
    tea_tools: "Trà cụ",
  };
  return labels[type] || type;
};

const getTeaTypeLabel = (type?: string): string | null => {
  if (!type) return null;
  const labels: Record<string, string> = {
    white: "Bạch",
    green: "Lục",
    yellow: "Hoàng",
    pink: "Hồng",
    black: "Hắc",
    scent: "Hàm Hương",
  };
  return labels[type] || type;
};

const getIngredientLabel = (ingredient?: string): string | null => {
  if (!ingredient) return null;
  const labels: Record<string, string> = {
    shan_tuyet: "Shan Tuyết",
    trung_du: "Trung Du",
    o_long: "Ô Long",
  };
  return labels[ingredient] || ingredient;
};

const getFinishedGoodsLabel = (goods?: string): string | null => {
  if (!goods) return null;
  const labels: Record<string, string> = {
    diep_tra: "Diệp trà",
    doan_tra: "Đoàn trà",
    mat_tra: "Mạt trà",
    vien_tra: "Viên trà",
  };
  return labels[goods] || goods;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCartStore();
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(
    product.attributes?.weight ?? null,
  );
  
  const handleAddToCart = () => {
    // Check if product is out of stock
    if (product.inventory !== undefined && product.inventory === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      addItem({
        id: product.id,
        title: product.name,
        price: product.price,
        image: product.image,
        qty,
      });
      
      toast.success("Đã thêm vào giỏ hàng", {
        description: product.name,
        duration: 2000,
      });
      
      // Optionally open cart modal after a short delay
      setTimeout(() => {
        setCartModalOpen(true);
      }, 500);
    } catch (error) {
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:gap-8">
        {/* Hình ảnh sản phẩm + thumbnails (kiểu Shopee) */}
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
            <ProductImage
              src={product.image || ""}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-md border",
                  idx === 0 ? "border-primary" : "border-border",
                )}
              >
                <ProductImage
                  src={product.image || ""}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm (layout giống Shopee) */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-sm bg-rose-500 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-white">
              yêu thích
            </span>
            <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700">
              chính hãng Tea Love
            </span>
          </div>

          <h1 className="mb-3 text-xl font-semibold leading-snug text-foreground sm:text-2xl">
            {product.name}
          </h1>

          {/* Đánh giá + đã bán */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {product.averageRating !== undefined && product.averageRating > 0 && (
              <>
                <div className="flex items-center gap-1 border-r border-border pr-3">
                  <span className="text-sm font-semibold text-rose-500">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Math.round(product.averageRating!)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300",
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  {product.reviewCount && (
                    <span className="ml-1 text-[11px]">
                      ({product.reviewCount} đánh giá)
                    </span>
                  )}
                </div>
              </>
            )}
            <span className="text-[11px]">
              Đã bán{" "}
              <span className="font-medium">
                {product.reviewCount ?? "100+"}
              </span>
            </span>
          </div>

          {/* Giá (ô nền màu giống Shopee) */}
          <div className="mb-5 rounded-md bg-[#fff5f5] px-4 py-3">
            <p className="text-2xl font-bold text-rose-600 sm:text-3xl">
              {formatCurrencyVND(product.price)}
            </p>
          </div>

          {/* Tuỳ chọn trọng lượng / phân loại đơn giản */}
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Khối lượng
            </p>
            <div className="flex flex-wrap gap-2">
              {["50g", "100g", "200g"].map((weight) => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => setSelectedWeight(weight)}
                  className={cn(
                    "rounded border px-3 py-1.5 text-xs",
                    selectedWeight === weight
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-rose-300",
                  )}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn số lượng */}
          <div className="mb-4 flex items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Số lượng
            </p>
            <div className="inline-flex items-center rounded border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-1 text-base text-slate-600 hover:bg-slate-50"
              >
                -
              </button>
              <span className="min-w-[32px] text-center text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-1 text-base text-slate-600 hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Nút thêm vào giỏ hàng */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                isAddingToCart ||
                (product.inventory !== undefined && product.inventory === 0)
              }
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {isAddingToCart ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang thêm...</span>
                </>
              ) : product.inventory !== undefined &&
                product.inventory === 0 ? (
                <span>Hết hàng</span>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Thêm vào giỏ</span>
                </>
              )}
            </button>
          </div>

          {/* Thông tin bảo hành/bảo đảm */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </div>
  );
}

