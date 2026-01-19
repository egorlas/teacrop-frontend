import type { Product } from "@/types/product";
import { formatCurrencyVND } from "@/lib/utils";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/lib/image-utils";

type ProductDetailsProps = {
  product: Product;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const hasSpecs = product.specifications && product.specifications.length > 0;
  console.log('product', product)
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
        {hasSpecs && (
          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Thông số kỹ thuật</h2>
            <dl className="space-y-3">
              {product.specifications!.map((spec, index) => (
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

        {/* Nút thêm vào giỏ hàng (placeholder) */}
        <button
          type="button"
          className="mt-auto w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Thêm vào giỏ hàng
        </button>

        {/* Thông tin bảo hành/bảo đảm */}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
        </div>
      </div>
    </div>
  );
}

