"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, Phone, User, Calendar, FileText, Loader2, Eye, Edit, Check, MoreVertical, Truck, X, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ToastContainer, type ToastProps } from "@/components/ui/toast";
import { strapiClient } from "@/lib/strapi/strapiClient";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  contactAddress?: string;
  trackingReference?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  subtotal: number;
  shippingFee?: number;
  discount?: number;
  paymentMethod: string;
  shippingCarrier?: string;
  products?: Array<{
    id?: string;
    name?: string;
    sku?: string;
    price?: number;
    quantity?: number;
  }>;
  createdAt: string;
  updatedAt: string;
  staff?: {
    id: number;
    username?: string;
    email?: string;
  };
}

interface OrdersResponse {
  data: Order[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export default function OrdersListPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [trackingReference, setTrackingReference] = useState("");
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [showOrderDetailDialog, setShowOrderDetailDialog] = useState(false);
  const [showOrderFullDetails, setShowOrderFullDetails] = useState(false);
  const [orderCopied, setOrderCopied] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        "pagination[page]": currentPage.toString(),
        "pagination[pageSize]": "25",
        sort: "createdAt:desc",
      });

      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const response = await strapiClient<OrdersResponse>(
        `/api/orders?${params.toString()}`,
        {
          method: "GET",
          token,
          requiresAuth: true,
        }
      );

      setOrders(response.data || []);
      setTotalPages(response.meta?.pagination?.pageCount || 1);
      setTotalOrders(response.meta?.pagination?.total || 0);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        label: "Đang chờ xử lý",
      },
      processing: {
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        label: "Đang xử lý",
      },
      shipped: {
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        label: "Đã gửi hàng",
      },
      delivered: {
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        label: "Đã giao hàng",
      },
      cancelled: {
        className:
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const paymentMethods: Record<string, string> = {
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản ngân hàng",
      credit_card: "Thẻ tín dụng",
      e_wallet: "Ví điện tử",
      cod: "Thanh toán khi nhận hàng (COD)",
    };
    return paymentMethods[method] || method;
  };

  // Toast helper functions
  const addToast = (toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handle update tracking reference
  const handleUpdateTrackingReference = async () => {
    if (!selectedOrder || !trackingReference.trim()) {
      addToast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập mã tham chiếu",
      });
      return;
    }

    setIsUpdatingTracking(true);
    try {
      const response = await strapiClient<{ data: Order }>(
        `/api/orders/${selectedOrder.id}/tracking-reference`,
        {
          method: "PUT",
          token,
          requiresAuth: true,
          body: JSON.stringify({
            data: { trackingReference: trackingReference.trim() },
          }),
        }
      );

      // Update order in list
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                trackingReference: response.data.trackingReference,
                status: response.data.status,
              }
            : o
        )
      );

      setShowTrackingDialog(false);
      setTrackingReference("");
      setSelectedOrder(null);

      addToast({
        variant: "default",
        title: "Thành công!",
        description: "Mã tham chiếu đã được cập nhật. Tồn kho đã được trừ tự động.",
      });

      // Refresh orders list
      fetchOrders();
    } catch (error: any) {
      console.error("Error updating tracking reference:", error);

      let errorMessage = "Không thể cập nhật mã tham chiếu. Vui lòng thử lại.";
      let errorDetails = "";

      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData.details || errorData.message || "";

        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorDetails = errorData.errors.join("\n");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast({
        variant: "destructive",
        title: "Lỗi cập nhật mã tham chiếu",
        description: errorDetails || errorMessage,
      });
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  // Handle update status to delivered
  const handleUpdateStatusToDelivered = async () => {
    if (!selectedOrder) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await strapiClient<{ data: Order }>(
        `/api/orders/${selectedOrder.id}/status`,
        {
          method: "PUT",
          token,
          requiresAuth: true,
          body: JSON.stringify({
            data: { status: "delivered" },
          }),
        }
      );

      // Update order in list
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: response.data.status } : o
        )
      );

      setShowStatusDialog(false);
      setSelectedOrder(null);

      addToast({
        variant: "default",
        title: "Thành công!",
        description: `Đơn hàng ${selectedOrder.orderNumber} đã được cập nhật trạng thái thành "Đã giao hàng".`,
      });

      // Refresh orders list
      fetchOrders();
    } catch (error: any) {
      console.error("Error updating order status:", error);

      let errorMessage = "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.";

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast({
        variant: "destructive",
        title: "Lỗi cập nhật trạng thái",
        description: errorMessage,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Danh sách đơn hàng</h1>
          </div>
          <Button
            onClick={() => router.push("/staff/orders")}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Tạo đơn hàng mới
          </Button>
        </div>
        <p className="text-muted-foreground">
          Xem và quản lý tất cả đơn hàng. Tìm kiếm theo mã đơn hàng, mã tham chiếu, tên khách hàng, số điện thoại hoặc nhân viên.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Label htmlFor="search" className="mb-2 block">
          Tìm kiếm đơn hàng
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, mã tham chiếu, tên khách hàng, số điện thoại, hoặc ID nhân viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {debouncedSearch && (
          <p className="text-xs text-muted-foreground mt-2">
            Tìm thấy {totalOrders} đơn hàng với từ khóa "{debouncedSearch}"
          </p>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Đang tải danh sách đơn hàng...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {debouncedSearch ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {debouncedSearch
              ? "Thử tìm kiếm với từ khóa khác"
              : "Tạo đơn hàng đầu tiên để bắt đầu"}
          </p>
          {!debouncedSearch && (
            <Button onClick={() => router.push("/staff/orders")}>
              Tạo đơn hàng mới
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Mã tham chiếu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Hình thức thanh toán
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-medium text-foreground">
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {order.customerName}
                          </div>
                          {order.customerPhone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-foreground">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.trackingReference ? (
                          <div className="font-mono text-xs text-foreground">
                            {order.trackingReference}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">
                          {order.paymentMethod ? getPaymentMethodLabel(order.paymentMethod) : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.staff ? (
                          <div className="text-xs text-foreground">
                            {order.staff.username || order.staff.email || `ID: ${order.staff.id}`}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewOrder(order);
                              setShowOrderDetailDialog(true);
                              setShowOrderFullDetails(false);
                            }}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Xem
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              {!order.trackingReference && order.status !== "cancelled" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setTrackingReference("");
                                    setShowTrackingDialog(true);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Cập nhật mã tham chiếu
                                </DropdownMenuItem>
                              )}
                              {order.status === "shipped" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowStatusDialog(true);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Đánh dấu đã giao hàng
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages} ({totalOrders} đơn hàng)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tracking Reference Dialog */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật mã tham chiếu</DialogTitle>
            <DialogDescription>
              Nhập mã tham chiếu cho đơn hàng {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="tracking-reference" className="mb-2 block">
                  Mã tham chiếu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tracking-reference"
                  type="text"
                  placeholder="Nhập mã tham chiếu (VD: GHN123456789)"
                  value={trackingReference}
                  onChange={(e) => setTrackingReference(e.target.value)}
                  className="font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && trackingReference.trim()) {
                      handleUpdateTrackingReference();
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Sau khi cập nhật mã tham chiếu, tồn kho sẽ tự động được trừ và trạng thái đơn hàng sẽ chuyển sang "Đã gửi hàng"
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTrackingDialog(false);
                setTrackingReference("");
                setSelectedOrder(null);
              }}
              disabled={isUpdatingTracking}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdateTrackingReference}
              disabled={isUpdatingTracking || !trackingReference.trim()}
            >
              {isUpdatingTracking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đã giao hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đánh dấu đơn hàng {selectedOrder?.orderNumber} đã được giao hàng?
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Khách hàng:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedOrder.customerName}
                  </span>
                </div>
                {selectedOrder.trackingReference && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mã tham chiếu:</span>
                    <span className="text-sm font-mono text-foreground">
                      {selectedOrder.trackingReference}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false);
                setSelectedOrder(null);
              }}
              disabled={isUpdatingStatus}
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatusToDelivered}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Xác nhận đã giao hàng
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đã giao hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đánh dấu đơn hàng {selectedOrder?.orderNumber} đã được giao hàng?
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Khách hàng:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedOrder.customerName}
                  </span>
                </div>
                {selectedOrder.trackingReference && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mã tham chiếu:</span>
                    <span className="text-sm font-mono text-foreground">
                      {selectedOrder.trackingReference}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tổng tiền:</span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false);
                setSelectedOrder(null);
              }}
              disabled={isUpdatingStatus}
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              onClick={handleUpdateStatusToDelivered}
              disabled={isUpdatingStatus}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Xác nhận đã giao hàng
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetailDialog} onOpenChange={setShowOrderDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Package className="h-6 w-6 text-primary" />
              Chi tiết đơn hàng
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn hàng {viewOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {viewOrder && (
            <div className="space-y-6 py-4">
              {/* Order Number with Copy */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Mã đơn hàng
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-lg font-semibold">
                    {viewOrder.orderNumber || viewOrder.id || "N/A"}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const orderNumber = viewOrder.orderNumber || viewOrder.id.toString() || "";
                      try {
                        await navigator.clipboard.writeText(orderNumber);
                        setOrderCopied(true);
                        setTimeout(() => setOrderCopied(false), 2000);
                      } catch (err) {
                        console.error("Failed to copy:", err);
                      }
                    }}
                    className="shrink-0"
                  >
                    {orderCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Đã copy
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Tên khách hàng</Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {viewOrder.customerName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {viewOrder.customerPhone || "N/A"}
                      </p>
                    </div>
                    {viewOrder.contactAddress && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Địa chỉ</Label>
                        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                          {viewOrder.contactAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Thông tin đơn hàng
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">{getStatusBadge(viewOrder.status)}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Hình thức thanh toán</Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {viewOrder.paymentMethod ? getPaymentMethodLabel(viewOrder.paymentMethod) : "N/A"}
                      </p>
                    </div>
                    {viewOrder.shippingCarrier && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Đơn vị vận chuyển</Label>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {viewOrder.shippingCarrier === "ghn" && "Giao Hàng Nhanh (GHN)"}
                          {viewOrder.shippingCarrier === "ghtk" && "Giao Hàng Tiết Kiệm (GHTK)"}
                          {viewOrder.shippingCarrier === "vtpost" && "Bưu Điện Việt Nam (ViettelPost)"}
                          {viewOrder.shippingCarrier === "jnt" && "J&T Express"}
                          {viewOrder.shippingCarrier === "ninjavan" && "Ninja Van"}
                          {viewOrder.shippingCarrier === "best_express" && "Best Express"}
                          {viewOrder.shippingCarrier === "dhl" && "DHL"}
                          {viewOrder.shippingCarrier === "fedex" && "FedEx"}
                          {viewOrder.shippingCarrier === "other" && "Khác"}
                        </p>
                      </div>
                    )}
                    {viewOrder.trackingReference && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Mã tham chiếu</Label>
                        <p className="text-sm font-mono text-foreground mt-1">
                          {viewOrder.trackingReference}
                        </p>
                      </div>
                    )}
                    {viewOrder.staff && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Nhân viên tạo đơn</Label>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {viewOrder.staff.username || viewOrder.staff.email || `ID: ${viewOrder.staff.id}`}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Ngày tạo</Label>
                      <p className="text-sm text-foreground mt-1">
                        {formatDate(viewOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Ngày cập nhật</Label>
                      <p className="text-sm text-foreground mt-1">
                        {formatDate(viewOrder.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {showOrderFullDetails && (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Chi tiết đơn hàng</h3>

                  {/* Products */}
                  {viewOrder.products && Array.isArray(viewOrder.products) && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Sản phẩm ({viewOrder.products.length})
                      </Label>
                      <div className="space-y-2">
                        {viewOrder.products.map((product: any, index: number) => {
                          const itemTotal = (product.price || 0) * (product.quantity || 1);
                          return (
                            <div
                              key={index}
                              className="flex items-start justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {product.name || "N/A"}
                                </p>
                                {product.sku && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    SKU: {product.sku}
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm text-foreground">
                                  {product.quantity || 1} ×{" "}
                                  {formatCurrency(product.price || 0)}
                                </p>
                                <p className="text-xs font-semibold text-primary mt-0.5">
                                  {formatCurrency(itemTotal)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(viewOrder.subtotal || 0)}
                      </span>
                    </div>
                    {(viewOrder.shippingFee || 0) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Phí vận chuyển:</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(viewOrder.shippingFee || 0)}
                        </span>
                      </div>
                    )}
                    {(viewOrder.discount || 0) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Giảm giá:</span>
                        <span className="font-medium text-destructive">
                          -{formatCurrency(viewOrder.discount || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-base font-semibold text-foreground">Tổng tiền:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(viewOrder.totalAmount || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* See More / See Less Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOrderFullDetails(!showOrderFullDetails)}
                  className="w-full"
                >
                  {showOrderFullDetails ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setShowOrderDetailDialog(false);
                setShowOrderFullDetails(false);
                setViewOrder(null);
              }}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      {toasts.length > 0 && <ToastContainer toasts={toasts} />}
    </div>
  );
}
