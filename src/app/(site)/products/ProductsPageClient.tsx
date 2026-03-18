"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import {
  List,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCT_TYPES = [
  { value: "tea", label: "Trà" },
  { value: "tea_tools", label: "Trà cụ" },
];

const TEA_TYPES = [
  { value: "white", label: "Bạch" },
  { value: "green", label: "Lục" },
  { value: "yellow", label: "Hoàng" },
  { value: "pink", label: "Hồng" },
  { value: "black", label: "Hắc" },
  { value: "scent", label: "Hàm Hương" },
];

const INGREDIENTS = [
  { value: "shan_tuyet", label: "Shan Tuyết" },
  { value: "trung_du", label: "Trung Du" },
  { value: "o_long", label: "Ô Long" },
];

const FINISHED_GOODS = [
  { value: "diep_tra", label: "Diệp trà" },
  { value: "doan_tra", label: "Đoàn trà" },
  { value: "mat_tra", label: "Mạt trà" },
  { value: "vien_tra", label: "Viên trà" },
];

/** Mỗi mục danh mục chỉ toggle một param (key + value) */
const CATEGORY_ITEMS: { label: string; paramKey: string; paramValue: string }[] = [
  { label: "Trà", paramKey: "productType", paramValue: "tea" },
  { label: "Trà xanh", paramKey: "teaType", paramValue: "green" },
  { label: "Trà đen", paramKey: "teaType", paramValue: "black" },
  { label: "Trà ô long", paramKey: "ingredient", paramValue: "o_long" },
  { label: "Trà cụ", paramKey: "productType", paramValue: "tea_tools" },
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
  const [filterOpen, setFilterOpen] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [priceSortOpen, setPriceSortOpen] = useState(false);
  const priceSortRef = useRef<HTMLDivElement>(null);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const productTypes = searchParams.getAll("productType");
  const teaTypes = searchParams.getAll("teaType");
  const ingredients = searchParams.getAll("ingredient");
  const finishedGoodsList = searchParams.getAll("finished_goods");
  const sort = searchParams.get("sort") || "createdAt:desc";
  const page = Number(searchParams.get("page")) || 1;

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
      if (!("page" in updates)) params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  /** Bật/tắt một giá trị trong bộ lọc nhiều lựa chọn */
  const toggleMultiFilter = useCallback(
    (paramKey: string, value: string) => {
      const current = searchParams.getAll(paramKey);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramKey);
      next.forEach((v) => params.append(paramKey, v));
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Dùng queryString làm dependency ổn định để tránh gọi API liên tục (mảng từ getAll() tạo reference mới mỗi render)
  const queryString = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(queryString);
    const searchVal = params.get("search") || "";
    const categoryVal = params.get("category") || "";
    const productTypesVal = params.getAll("productType");
    const teaTypesVal = params.getAll("teaType");
    const ingredientsVal = params.getAll("ingredient");
    const finishedGoodsVal = params.getAll("finished_goods");
    const sortVal = params.get("sort") || "createdAt:desc";
    const pageVal = Number(params.get("page")) || 1;

    const filters: Record<string, string | string[]> = {};
    if (categoryVal) filters["product_category.slug"] = categoryVal;
    if (productTypesVal.length) filters["productType"] = productTypesVal;
    if (teaTypesVal.length) filters["teaType"] = teaTypesVal;
    if (ingredientsVal.length) filters["ingredient"] = ingredientsVal;
    if (finishedGoodsVal.length) filters["finished_goods"] = finishedGoodsVal;

    setIsLoading(true);
    getProducts({
      populate: "*",
      pagination: { page: pageVal, pageSize: 12 },
      search: searchVal || undefined,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: [sortVal],
    })
      .then((response) => {
        if (!cancelled) {
          setProducts(response.data);
          setPagination(response.meta.pagination);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching products:", error);
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryString]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priceSortRef.current && !priceSortRef.current.contains(e.target as Node)) {
        setPriceSortOpen(false);
      }
    };
    if (priceSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [priceSortOpen]);

  const handleSort = (value: string) => {
    setPriceSortOpen(false);
    updateParams({ sort: value });
  };

  const isSortActive = (value: string) => sort === value;
  const isPriceSort = (v: string) => v === "price:asc" || v === "price:desc";

  return (
    <div className="flex flex-col gap-6 py-6 lg:flex-row">
      {/* Left sidebar - Tất Cả Danh Mục + BỘ LỌC */}
      <aside className="w-full shrink-0 rounded-lg border border-border bg-card p-4 lg:w-56 xl:w-64">
        {/* Tất Cả Danh Mục */}
        <div className="border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setCategoryExpanded(!categoryExpanded)}
            className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm font-semibold text-foreground"
          >
            <span className="flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              Tất Cả Danh Mục
            </span>
            {categoryExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
          {categoryExpanded && (
            <ul className="mt-2 space-y-0.5 pl-1">
              {CATEGORY_ITEMS.map((item) => {
                const currentList = searchParams.getAll(item.paramKey);
                const isActive = currentList.includes(item.paramValue);
                return (
                  <li key={`${item.paramKey}-${item.paramValue}`}>
                    <button
                      type="button"
                      onClick={() => toggleMultiFilter(item.paramKey, item.paramValue)}
                      className={cn(
                        "w-full rounded px-2 py-1.5 text-left text-sm",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex w-full items-center justify-between gap-2 py-1.5 text-left text-sm font-semibold uppercase tracking-wide text-foreground"
          >
            Bộ Lọc Tìm Kiếm
            {filterOpen ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            )}
          </button>
          {filterOpen && (
            <div className="mt-3 space-y-4">
              {/* Phân loại sản phẩm - tích nhiều lựa chọn */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Phân loại sản phẩm</p>
                <div className="space-y-1.5">
                  {PRODUCT_TYPES.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={productTypes.includes(opt.value)}
                        onChange={() => toggleMultiFilter("productType", opt.value)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Loại trà - tích nhiều lựa chọn */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Loại trà</p>
                <div className="space-y-1.5">
                  {TEA_TYPES.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={teaTypes.includes(opt.value)}
                        onChange={() => toggleMultiFilter("teaType", opt.value)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Thành phần - tích nhiều lựa chọn */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Thành phần</p>
                <div className="space-y-1.5">
                  {INGREDIENTS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={ingredients.includes(opt.value)}
                        onChange={() => toggleMultiFilter("ingredient", opt.value)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Thành phẩm - tích nhiều lựa chọn */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Thành phẩm</p>
                <div className="space-y-1.5">
                  {FINISHED_GOODS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={finishedGoodsList.includes(opt.value)}
                        onChange={() => toggleMultiFilter("finished_goods", opt.value)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right - Sort bar + Product grid + Pagination */}
      <div className="min-w-0 flex-1">
        {/* Sort bar: Sắp xếp theo [Phổ Biến] [Mới Nhất] [Bán Chạy] [Giá ▼] -------- 1/7 < > */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Sắp xếp theo</span>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                variant={isSortActive("createdAt:desc") ? "default" : "ghost"}
                size="sm"
                className="h-8 text-sm"
                onClick={() => handleSort("createdAt:desc")}
              >
                Phổ Biến
              </Button>
              <Button
                variant={isSortActive("createdAt:desc") ? "default" : "ghost"}
                size="sm"
                className="h-8 text-sm"
                onClick={() => handleSort("createdAt:desc")}
              >
                Mới Nhất
              </Button>
              <Button
                variant={isSortActive("title:asc") ? "default" : "ghost"}
                size="sm"
                className="h-8 text-sm"
                onClick={() => handleSort("title:asc")}
              >
                Bán Chạy
              </Button>
              {/* Đã bỏ sắp xếp theo giá vì sản phẩm không còn trường giá */}
            </div>
          </div>
          {/* Pagination indicator */}
          {pagination.pageCount > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {page}/{pagination.pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  updateParams({
                    page: String(Math.max(1, page - 1)),
                  })
                }
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  updateParams({
                    page: String(Math.min(pagination.pageCount, page + 1)),
                  })
                }
                disabled={page === pagination.pageCount}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="mb-3 text-sm text-muted-foreground">
            Tìm thấy {pagination.total} sản phẩm
            {search && ` cho "${search}"`}
          </p>
        )}

        {/* Product grid - 5 cols like image */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Bottom pagination */}
            {pagination.pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateParams({
                      page: String(Math.max(1, page - 1)),
                    })
                  }
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <span className="text-sm text-muted-foreground">
                  Trang {page} / {pagination.pageCount}
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
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy sản phẩm nào với bộ lọc hiện tại.
            </p>
            <Button
              variant="outline"
              onClick={() =>
                updateParams({
                  search: null,
                  category: null,
                  productType: null,
                  teaType: null,
                  ingredient: null,
                  finished_goods: null,
                  sort: "createdAt:desc",
                })
              }
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const KEY_FEATURES = [
  {
    title: "Chất lượng cao cấp",
    description:
      "Sản phẩm được chọn lọc từ các vùng trà nổi tiếng, đảm bảo hương vị đậm đà và nguyên chất",
    image: "https://i.pinimg.com/1200x/5e/9e/2d/5e9e2d379c4934d333247091f0e5509a.jpg",
    icon: "⭐",
  },
  {
    title: "Giao hàng nhanh chóng",
    description:
      "Miễn phí vận chuyển cho đơn hàng trên 500.000đ. Giao hàng trong 24h tại nội thành",
    image: "https://i.pinimg.com/736x/a4/c7/87/a4c787e6965646bb782136cad81dc254.jpg",
    icon: "🚚",
  },
  {
    title: "Đóng gói cẩn thận",
    description:
      "Bao bì chuyên dụng giữ nguyên hương vị và chất lượng trà, đảm bảo sản phẩm đến tay bạn hoàn hảo",
    image:
      "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754658/strapi/large_DSCF_0247_898a41e840.jpg",
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
    <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
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
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
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

export function ProductsPageClient() {
  return (
    <>
      <section className="border-b border-border bg-card py-6">
        <Container>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Khám phá bộ sưu tập trà Việt Nam chất lượng cao
          </p>
        </Container>
      </section>

      <Container>
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

      <KeyFeaturesSection />
    </>
  );
}

