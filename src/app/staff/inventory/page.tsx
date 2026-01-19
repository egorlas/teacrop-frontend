"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, Loader2, AlertCircle, CheckCircle, AlertTriangle, DollarSign, Hash } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, type ToastProps } from "@/components/ui/toast";
import { strapiClient } from "@/lib/strapi/strapiClient";

interface InventoryProduct {
  id: number;
  title?: string;
  sku?: string;
  inventory?: number;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  // Strapi v5 flat structure
  attributes?: {
    title?: string;
    sku?: string;
    inventory?: number;
    price?: number;
    createdAt?: string;
    updatedAt?: string;
  };
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

// Transform Strapi product to flat structure
function transformProduct(product: InventoryProduct): InventoryProduct {
  // Check if structure is flat (Strapi v5) or nested (Strapi v4)
  const isFlat = !product.attributes || 'title' in product;
  
  if (isFlat) {
    return product;
  }
  
  // Transform nested structure to flat
  return {
    id: product.id,
    title: product.attributes?.title,
    sku: product.attributes?.sku,
    inventory: product.attributes?.inventory,
    price: product.attributes?.price,
    createdAt: product.attributes?.createdAt,
    updatedAt: product.attributes?.updatedAt,
  };
}

function getInventoryStatus(inventory: number | undefined): {
  label: string;
  variant: "default" | "destructive" | "secondary" | "outline";
  icon: React.ComponentType<{ className?: string }>;
} {
  if (inventory === undefined || inventory === null) {
    return {
      label: "Chưa cập nhật",
      variant: "outline",
      icon: AlertCircle,
    };
  }
  
  if (inventory === 0) {
    return {
      label: "Hết hàng",
      variant: "destructive",
      icon: AlertCircle,
    };
  }
  
  if (inventory < 10) {
    return {
      label: "Sắp hết",
      variant: "destructive",
      icon: AlertTriangle,
    };
  }
  
  if (inventory < 50) {
    return {
      label: "Còn hàng",
      variant: "secondary",
      icon: CheckCircle,
    };
  }
  
  return {
    label: "Đủ hàng",
    variant: "default",
    icon: CheckCircle,
  };
}

function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) {
    return "N/A";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function InventoryPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);
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
        "sort": "updatedAt:desc",
      });

      // Add search filter if exists
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
        }
      );

      if (response?.data) {
        // Transform products to flat structure
        const transformedProducts = response.data.map(transformProduct);
        setProducts(transformedProducts);
        setTotalProducts(response.meta?.pagination?.total || 0);
        setTotalPages(response.meta?.pagination?.pageCount || 1);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
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

  // Calculate statistics
  const stats = {
    total: totalProducts,
    inStock: products.filter((p) => (p.inventory ?? 0) > 0).length,
    lowStock: products.filter((p) => {
      const inv = p.inventory ?? 0;
      return inv > 0 && inv < 10;
    }).length,
    outOfStock: products.filter((p) => (p.inventory ?? 0) === 0).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>
          <p className="text-muted-foreground mt-1">
            Danh sách sản phẩm và số lượng tồn kho
          </p>
        </div>
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
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-right p-4 font-medium">Giá</th>
                    <th className="text-right p-4 font-medium">Tồn kho</th>
                    <th className="text-center p-4 font-medium">Trạng thái</th>
                    <th className="text-left p-4 font-medium">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const status = getInventoryStatus(product.inventory);
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium">{product.title || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Hash className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {product.sku || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatPrice(product.price)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold">
                            {product.inventory !== undefined && product.inventory !== null
                              ? product.inventory.toLocaleString("vi-VN")
                              : "N/A"}
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
                        <td className="p-4 text-sm text-muted-foreground">
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                            : "N/A"}
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
