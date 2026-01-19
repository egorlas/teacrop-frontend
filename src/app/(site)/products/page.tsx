"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import { Search, X, ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = {
  value: string;
  label: string;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "title:asc", label: "Tên A-Z" },
  { value: "title:desc", label: "Tên Z-A" },
  { value: "createdAt:desc", label: "Mới nhất" },
  { value: "createdAt:asc", label: "Cũ nhất" },
];

function ProductsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    pageCount: 1,
    total: 0,
  });

  // Get current filter values from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const productType = searchParams.get("productType") || "";
  const sort = searchParams.get("sort") || "createdAt:desc";
  const page = Number(searchParams.get("page")) || 1;

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset to page 1 when filters change (except when updating page itself)
      if (!("page" in updates)) {
        params.set("page", "1");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: Record<string, any> = {};

      // Category filter
      if (category) {
        filters["product_category.slug"] = category;
      }

      // Product type filter
      if (productType) {
        filters["productType"] = productType;
      }

      const response = await getProducts({
        populate: "*",
        pagination: { page, pageSize: 12 },
        search: search || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: [sort],
      });

      setProducts(response.data);
      setPagination(response.meta.pagination);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, category, productType, sort, page]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (value: string) => {
    updateParams({ search: value });
  };

  const handleCategoryChange = (categorySlug: string | null) => {
    updateParams({ category: categorySlug || null });
  };

  const handleProductTypeChange = (type: string | null) => {
    updateParams({ productType: type || null });
  };

  const handleSortChange = (sortValue: string) => {
    updateParams({ sort: sortValue });
  };

  const clearFilters = () => {
    updateParams({
      search: null,
      category: null,
      productType: null,
      sort: "createdAt:desc",
    });
  };

  const hasActiveFilters =
    search || category || productType || sort !== "createdAt:desc";

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sort)?.label || "Sắp xếp";

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Product Type Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Phân Loại sản phẩm
                {productType && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({productType === "trà" ? "Trà" : "Trà cụ"})
                  </span>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Phân Loại sản phẩm</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleProductTypeChange(null)}
                className={cn(
                  !productType && "bg-accent"
                )}
              >
                Tất cả
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleProductTypeChange("trà")}
                className={cn(
                  productType === "trà" && "bg-accent"
                )}
              >
                Trà
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleProductTypeChange("trà cụ")}
                className={cn(
                  productType === "trà cụ" && "bg-accent"
                )}
              >
                Trà cụ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                {currentSortLabel}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SORT_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={cn(
                    sort === option.value && "bg-accent"
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Tìm thấy {pagination.total} sản phẩm
          {search && ` cho "${search}"`}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              <Button
                variant="outline"
                onClick={() => updateParams({ page: String(Math.max(1, page - 1)) })}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.pageCount}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  updateParams({
                    page: String(Math.min(pagination.pageCount, page + 1)),
                  })
                }
                disabled={page === pagination.pageCount}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "Không tìm thấy sản phẩm nào với bộ lọc hiện tại."
              : "Chưa có sản phẩm nào."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const KEY_FEATURES = [
  {
    title: "Chất lượng cao cấp",
    description: "Sản phẩm được chọn lọc từ các vùng trà nổi tiếng, đảm bảo hương vị đậm đà và nguyên chất",
    image: "https://i.pinimg.com/1200x/5e/9e/2d/5e9e2d379c4934d333247091f0e5509a.jpg",
    icon: "⭐",
  },
  {
    title: "Giao hàng nhanh chóng",
    description: "Miễn phí vận chuyển cho đơn hàng trên 500.000đ. Giao hàng trong 24h tại nội thành",
    image: "https://i.pinimg.com/736x/a4/c7/87/a4c787e6965646bb782136cad81dc254.jpg",
    icon: "🚚",
  },
  {
    title: "Đóng gói cẩn thận",
    description: "Bao bì chuyên dụng giữ nguyên hương vị và chất lượng trà, đảm bảo sản phẩm đến tay bạn hoàn hảo",
    image: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754658/strapi/large_DSCF_0247_898a41e840.jpg",
    icon: "📦",
  },
  {
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi",
    image: "https://i.pinimg.com/736x/44/49/85/444985873037e3281d2ec8adc49f4bc9.jpg",
    icon: "💬",
  },
];

function KeyFeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-lg text-muted-foreground">
            Cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {KEY_FEATURES.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-2 text-3xl">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">
                    {feature.title}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function ProductsPage() {
  return (
    <>
      <section className="py-16 sm:py-24">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Sản phẩm của chúng tôi
            </h1>
            <p className="text-lg text-muted-foreground">
              Khám phá bộ sưu tập trà Việt Nam chất lượng cao được chọn lọc kỹ lưỡng
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            }
          >
            <ProductsList />
          </Suspense>
        </Container>
      </section>
      
      <KeyFeaturesSection />
    </>
  );
}
