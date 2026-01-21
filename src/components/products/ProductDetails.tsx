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
  
  // Build specifications array from new fields
  const specifications: Array<{ label: string; value: string }> = [];
  
  // Add existing specifications
  if (product.specifications) {
    specifications.push(...product.specifications);
  }
  
  // Add new enum fields
  if (product.productType) {
    const label = getProductTypeLabel(product.productType);
    if (label) {
      specifications.push({ label: "Phân loại", value: label });
    }
  }
  
  if (product.teaType) {
    const label = getTeaTypeLabel(product.teaType);
    if (label) {
      specifications.push({ label: "Loại trà", value: label });
    }
  }
  
  if (product.ingredient) {
    const label = getIngredientLabel(product.ingredient);
    if (label) {
      specifications.push({ label: "Thành phần", value: label });
    }
  }
  
  if (product.finished_goods) {
    const label = getFinishedGoodsLabel(product.finished_goods);
    if (label) {
      specifications.push({ label: "Thành phẩm", value: label });
    }
  }
  
  // Add attributes JSON fields
  if (product.attributes) {
    if (product.attributes.brand) {
      specifications.push({ label: "Thương hiệu", value: product.attributes.brand });
    }
    if (product.attributes.origin) {
      specifications.push({ label: "Xuất xứ", value: product.attributes.origin });
    }
    if (product.attributes.weight) {
      specifications.push({ label: "Trọng lượng", value: product.attributes.weight });
    }
    if (product.attributes.package) {
      specifications.push({ label: "Đóng gói", value: product.attributes.package });
    }
    if (product.attributes.expiry) {
      specifications.push({ label: "Hạn sử dụng", value: product.attributes.expiry });
    }
  }
  
  // Add SKU if available
  if (product.sku) {
    specifications.push({ label: "SKU", value: product.sku });
  }
  
  const hasAnySpecs = specifications.length > 0;
  
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
        qty: 1,
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
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Hình ảnh sản phẩm */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
        <ProductImage
          src={product.image || ''}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex flex-col">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {product.name}
        </h1>

        {product.note && (
          <p className="mb-6 text-lg text-muted-foreground">{product.note}</p>
        )}

        {/* Đánh giá */}
        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="mb-6 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.round(product.averageRating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted",
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-foreground">
              {product.averageRating.toFixed(1)}
            </span>
            {product.reviewCount && (
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} đánh giá)
              </span>
            )}
          </div>
        )}

        {/* Giá */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-foreground">
            {formatCurrencyVND(product.price)}
          </p>
        </div>

        {/* Thông số kỹ thuật */}
        {hasAnySpecs && (
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Thông số kỹ thuật</h2>
            <dl className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 border-b border-border pb-3 last:border-0">
                  <dt className="min-w-[120px] text-sm font-medium text-muted-foreground sm:min-w-[150px]">
                    {spec.label}
                  </dt>
                  <dd className="flex-1 text-sm text-card-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Nút thêm vào giỏ hàng */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAddingToCart || (product.inventory !== undefined && product.inventory === 0)}
          className={cn(
            "mt-auto w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          )}
        >
          {isAddingToCart ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              <span>Đang thêm...</span>
            </>
          ) : product.inventory !== undefined && product.inventory === 0 ? (
            <>
              <span>Hết hàng</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Thêm vào giỏ hàng</span>
            </>
          )}
        </button>

        {/* Thông tin bảo hành/bảo đảm */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
        </div>
      </div>
      
      {/* Cart Modal */}
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </div>
  );
}

