"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { strapiClient } from "@/lib/strapi/strapiClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: string;
}

interface Product {
  id: number;
  title?: string;
  sku?: string;
  inventory?: number;
  price?: number;
  // Strapi v4 nested structure
  attributes?: {
    title?: string;
    sku?: string;
    inventory?: number;
    price?: number;
  };
}

interface OrdersResponse {
  data: Order[];
  meta: {
    pagination: {
      total: number;
    };
  };
}

interface ProductsResponse {
  data: Product[];
  meta: {
    pagination: {
      total: number;
    };
  };
}

interface OrderStats {
  total: number;
  byStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  today: number;
  thisMonth: number;
  thisYear: number;
}

function transformProduct(product: Product): Product {
  // Check if structure is flat (Strapi v5) or nested (Strapi v4)
  const isFlat = !product.attributes || "title" in product;
  if (isFlat) {
    return product;
  }
  return {
    id: product.id,
    title: product.attributes?.title,
    sku: product.attributes?.sku,
    inventory: product.attributes?.inventory,
    price: product.attributes?.price,
  };
}

function getStatusConfig(status: string) {
  const configs = {
    pending: {
      label: "Đang chờ",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    processing: {
      label: "Đang xử lý",
      icon: Package,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
    shipped: {
      label: "Đã gửi hàng",
      icon: Truck,
      className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    },
    delivered: {
      label: "Đã giao",
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    cancelled: {
      label: "Đã hủy",
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
  };
  return configs[status as keyof typeof configs] || configs.pending;
}

export default function StaffDashboardPage() {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    byStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    today: 0,
    thisMonth: 0,
    thisYear: 0,
  });
  const [lowInventoryProducts, setLowInventoryProducts] = useState<Product[]>([]);

  // Calculate date ranges
  const getDateRanges = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    return {
      today: today.toISOString(),
      thisMonth: thisMonth.toISOString(),
      thisYear: thisYear.toISOString(),
    };
  };

  // Fetch orders statistics
  const fetchOrderStats = useCallback(async () => {
    if (!token) return;

    try {
      const dates = getDateRanges();

      // Fetch all orders (we'll filter client-side for stats)
      const allOrdersParams = new URLSearchParams({
        "pagination[pageSize]": "1000", // Get all orders for stats
        sort: "createdAt:desc",
      });

      const allOrdersResponse = await strapiClient<OrdersResponse>(
        `/api/orders?${allOrdersParams.toString()}`,
        {
          method: "GET",
          token,
          requiresAuth: true,
        }
      );

      const orders = allOrdersResponse.data || [];

      // Calculate stats
      const stats: OrderStats = {
        total: allOrdersResponse.meta?.pagination?.total || 0,
        byStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        today: 0,
        thisMonth: 0,
        thisYear: 0,
      };

      orders.forEach((order) => {
        // Count by status
        if (order.status && stats.byStatus.hasOwnProperty(order.status)) {
          stats.byStatus[order.status as keyof typeof stats.byStatus]++;
        }

        // Count by date
        const orderDate = new Date(order.createdAt);
        if (orderDate >= new Date(dates.today)) {
          stats.today++;
        }
        if (orderDate >= new Date(dates.thisMonth)) {
          stats.thisMonth++;
        }
        if (orderDate >= new Date(dates.thisYear)) {
          stats.thisYear++;
        }
      });

      setOrderStats(stats);
    } catch (error: any) {
      console.error("Error fetching order stats:", error);
    }
  }, [token]);

  // Fetch low inventory products (inventory < 100)
  const fetchLowInventoryProducts = useCallback(async () => {
    if (!token) return;

    try {
      const params = new URLSearchParams({
        "pagination[pageSize]": "100",
        "sort": "inventory:asc",
        "filters[inventory][$lt]": "100",
      });

      const response = await strapiClient<ProductsResponse>(
        `/api/products?${params.toString()}`,
        {
          method: "GET",
          token,
          requiresAuth: true,
        }
      );

      if (response?.data) {
        const transformedProducts = response.data.map(transformProduct);
        // Filter products with inventory < 100 (in case API filter didn't work)
        const lowInventory = transformedProducts.filter(
          (p) => (p.inventory ?? 0) < 100
        );
        setLowInventoryProducts(lowInventory.slice(0, 10)); // Show top 10
      }
    } catch (error: any) {
      console.error("Error fetching low inventory products:", error);
    }
  }, [token]);

  // Fetch all data on mount
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([fetchOrderStats(), fetchLowInventoryProducts()]).finally(() => {
      setIsLoading(false);
    });
  }, [token, fetchOrderStats, fetchLowInventoryProducts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Tổng quan về đơn hàng và kho hàng
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Order Analytics Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Thống kê Đơn hàng
            </h2>

            {/* Order Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.total}</div>
                  <p className="text-xs text-muted-foreground">Tất cả đơn hàng</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.today}</div>
                  <p className="text-xs text-muted-foreground">Đơn hàng mới</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.thisMonth}</div>
                  <p className="text-xs text-muted-foreground">Đơn hàng trong tháng</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Năm nay</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.thisYear}</div>
                  <p className="text-xs text-muted-foreground">Đơn hàng trong năm</p>
                </CardContent>
              </Card>
            </div>

            {/* Order Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Đơn hàng theo trạng thái</CardTitle>
                <CardDescription>
                  Số lượng đơn hàng được phân loại theo từng trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(orderStats.byStatus).map(([status, count]) => {
                    const config = getStatusConfig(status);
                    const Icon = config.icon;
                    return (
                      <div
                        key={status}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card"
                      >
                        <Icon className="h-6 w-6 mb-2 text-muted-foreground" />
                        <div className="text-2xl font-bold mb-1">{count}</div>
                        <Badge variant="outline" className={config.className}>
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Analytics Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Cảnh báo Tồn kho
              </h2>
              <Link href="/staff/inventory">
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm sắp hết hàng</CardTitle>
                <CardDescription>
                  Danh sách sản phẩm có tồn kho dưới 100 đơn vị
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lowInventoryProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                    <p className="text-muted-foreground">
                      Không có sản phẩm nào cần cảnh báo
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tất cả sản phẩm đều có tồn kho trên 100 đơn vị
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Tên sản phẩm</th>
                          <th className="text-left p-3 font-medium">SKU</th>
                          <th className="text-right p-3 font-medium">Tồn kho</th>
                          <th className="text-center p-3 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowInventoryProducts.map((product) => {
                          const inventory = product.inventory ?? 0;
                          const isLow = inventory < 10;
                          const isWarning = inventory >= 10 && inventory < 50;
                          const isCritical = inventory === 0;

                          return (
                            <tr
                              key={product.id}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <td className="p-3">
                                <div className="font-medium">{product.title || "N/A"}</div>
                              </td>
                              <td className="p-3">
                                <code className="text-sm text-muted-foreground">
                                  {product.sku || "N/A"}
                                </code>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-semibold">
                                  {inventory.toLocaleString("vi-VN")}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex justify-center">
                                  {isCritical ? (
                                    <Badge variant="destructive" className="gap-1.5">
                                      <XCircle className="h-3 w-3" />
                                      Hết hàng
                                    </Badge>
                                  ) : isLow ? (
                                    <Badge variant="destructive" className="gap-1.5">
                                      <AlertTriangle className="h-3 w-3" />
                                      Sắp hết
                                    </Badge>
                                  ) : isWarning ? (
                                    <Badge variant="secondary" className="gap-1.5">
                                      <AlertCircle className="h-3 w-3" />
                                      Cần bổ sung
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="gap-1.5">
                                      <AlertTriangle className="h-3 w-3" />
                                      Dưới mức
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/staff/orders">
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Tạo đơn hàng mới
                  </Button>
                </Link>
                <Link href="/staff/orders-list">
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Xem danh sách đơn hàng
                  </Button>
                </Link>
                <Link href="/staff/inventory">
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Quản lý kho hàng
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
