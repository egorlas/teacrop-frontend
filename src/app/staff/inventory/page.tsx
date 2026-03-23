"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Hash,
  Plus,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ToastContainer, type ToastProps } from "@/components/ui/toast";
import { strapiClient } from "@/lib/strapi/strapiClient";

interface InventoryProduct {
  id: number;
  title?: string;
  sku?: string;
  enable?: boolean | null;
  productType?: string;
  teaType?: string;
  ingredient?: string;
  finished_goods?: string;
  inventorySummary?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsResponse {
  data: InventoryProduct[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

function getInventoryStatus(summary: string | undefined): {
  label: string;
  variant: "default" | "destructive" | "secondary" | "outline";
  icon: React.ComponentType<{ className?: string }>;
} {
  if (!summary) {
    return { label: "Chưa cập nhật", variant: "outline", icon: AlertCircle };
  }
  if (summary.includes("Hết")) {
    return { label: "Có biến thể hết hàng", variant: "destructive", icon: AlertCircle };
  }
  if (summary.includes("Sắp hết")) {
    return { label: "Có biến thể sắp hết", variant: "destructive", icon: AlertTriangle };
  }
  return { label: "Ổn định", variant: "default", icon: CheckCircle };
}

export default function InventoryPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [togglingProductIds, setTogglingProductIds] = useState<number[]>([]);
  const pageSize = 25;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        "pagination[page]": String(currentPage),
        "pagination[pageSize]": String(pageSize),
        "pagination[withCount]": "true",
        "sort[0]": "updatedAt:desc",
        "populate[product_variants][fields][0]": "inventory",
      });

      queryParams.append("fields[0]", "title");
      queryParams.append("fields[1]", "sku");
      queryParams.append("fields[2]", "productType");
      queryParams.append("fields[3]", "teaType");
      queryParams.append("fields[4]", "ingredient");
      queryParams.append("fields[5]", "finished_goods");
      queryParams.append("fields[6]", "enable");
      queryParams.append("fields[7]", "createdAt");
      queryParams.append("fields[8]", "updatedAt");

      if (debouncedSearch.trim()) {
        queryParams.append("filters[$or][0][title][$contains]", debouncedSearch.trim());
        queryParams.append("filters[$or][1][sku][$contains]", debouncedSearch.trim());
      }

      const response = await strapiClient<ProductsResponse>(
        `/api/products?${queryParams.toString()}`,
        {
          method: "GET",
          token,
          requiresAuth: true,
          cache: "no-store",
        }
      );

      if (response?.data) {
        // Với Strapi v5, dữ liệu product đã là flat, chỉ cần map thêm summary tồn kho từ product_variants nếu có
        const transformed = response.data.map((pRaw: any) => {
          const p = pRaw?.attributes ? { ...pRaw.attributes, id: pRaw.id } : pRaw;
          const rawEnable = p?.enable;
          const normalizedEnable =
            typeof rawEnable === "boolean"
              ? rawEnable
              : rawEnable === "true"
                ? true
                : rawEnable === "false"
                  ? false
                  : null;
          let inventorySummary: string | undefined;
          const variants = p.product_variants || [];
          if (Array.isArray(variants) && variants.length > 0) {
            const total = variants.reduce(
              (acc: number, v: any) => acc + (v.inventory ?? 0),
              0,
            );
            const anyOut = variants.some((v: any) => (v.inventory ?? 0) === 0);
            const anyLow = variants.some((v: any) => {
              const inv = v.inventory ?? 0;
              return inv > 0 && inv < 10;
            });
            if (anyOut) {
              inventorySummary = `Tổng ${total.toLocaleString("vi-VN")} (có biến thể hết hàng)`;
            } else if (anyLow) {
              inventorySummary = `Tổng ${total.toLocaleString("vi-VN")} (có biến thể sắp hết)`;
            } else {
              inventorySummary = `Tổng ${total.toLocaleString("vi-VN")}`;
            }
          }
          return {
            id: p.id,
            title: p.title,
            sku: p.sku,
            enable: normalizedEnable,
            productType: p.productType,
            teaType: p.teaType,
            ingredient: p.ingredient,
            finished_goods: p.finished_goods,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            inventorySummary,
          } as InventoryProduct;
        });
        setProducts(transformed);
        setTotalProducts(response.meta?.pagination?.total || 0);
        setTotalPages(response.meta?.pagination?.pageCount || 1);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Không thể tải danh sách sản phẩm. Vui lòng thử lại.";
      addToast({
        id: Date.now().toString(),
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (toast: ToastProps) => {
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        onClose: () => removeToast(toast.id),
      },
    ]);
  };

  const handleToggleEnable = async (product: InventoryProduct) => {
    if (!token) {
      addToast({
        id: Date.now().toString(),
        title: "Lỗi",
        description: "Thiếu token xác thực. Vui lòng đăng nhập lại.",
        variant: "destructive",
      });
      return;
    }

    const nextEnable = !Boolean(product.enable);
    setTogglingProductIds((prev) => [...prev, product.id]);

    try {
      await strapiClient(`/api/products/${product.id}`, {
        method: "PUT",
        token,
        requiresAuth: true,
        body: JSON.stringify({
          data: {
            enable: nextEnable,
          },
        }),
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, enable: nextEnable } : p)),
      );

      addToast({
        id: Date.now().toString(),
        title: "Thành công",
        description: nextEnable
          ? "Sản phẩm đã hiển thị cho khách hàng trên website."
          : "Sản phẩm đã được ẩn khỏi website khách hàng.",
      });
    } catch (error: any) {
      addToast({
        id: Date.now().toString(),
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật trạng thái bán của sản phẩm.",
        variant: "destructive",
      });
    } finally {
      setTogglingProductIds((prev) => prev.filter((id) => id !== product.id));
    }
  };

  // Thống kê đơn giản theo số product
  const stats = {
    total: totalProducts,
    inStock: products.length, // giữ placeholder, có thể refine sau theo summary
    lowStock: 0,
    outOfStock: 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>
          <p className="text-muted-foreground mt-1">
            Danh sách sản phẩm, click để xem chi tiết biến thể và tồn kho
          </p>
        </div>
        <Button
          type="button"
          className="gap-2"
          onClick={() => router.push("/staff/inventory/new")}
        >
          <Plus className="h-4 w-4" />
          Tạo sản phẩm mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Còn hàng</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.inStock}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sắp hết</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStock}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Đang tải...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {debouncedSearch ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Tên sản phẩm</th>
                    <th className="text-left p-4 font-medium">Loại</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Tồn kho (tổng kết)</th>
                    <th className="text-center p-4 font-medium">Trạng thái</th>
                    <th className="text-center p-4 font-medium">Hiển thị với khách</th>
                    <th className="text-left p-4 font-medium">Cập nhật</th>
                    <th className="text-center p-4 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const status = getInventoryStatus(product.inventorySummary);
                    const StatusIcon = status.icon;
                    const isEnabled = product.enable === true;
                    const isToggling = togglingProductIds.includes(product.id);

                    return (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium">{product.title || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {product.productType || "-"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Hash className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {product.sku || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">
                            {product.inventorySummary || "Chưa cập nhật"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <Badge variant={status.variant} className="gap-1.5">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleEnable(product)}
                              disabled={isToggling}
                              aria-label={`Trạng thái bán của ${product.title || "sản phẩm"}`}
                            />
                            <Badge variant={isEnabled ? "default" : "secondary"}>
                              {isToggling
                                ? "Đang cập nhật..."
                                : product.enable === null
                                  ? "Chưa có dữ liệu"
                                  : isEnabled
                                  ? "Đang hiển thị"
                                  : "Tạm ẩn"}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Link
                              href={`/staff/inventory/${product.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded border hover:bg-muted transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              Xem chi tiết kho
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalProducts)} trong tổng số{" "}
                  {totalProducts} sản phẩm
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Trước
                  </Button>
                  <div className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
