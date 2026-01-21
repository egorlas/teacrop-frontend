"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Container } from "@/components/Container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, Phone, Calendar, FileText, Loader2, Eye, ExternalLink, CheckCircle2, Clock, Truck, XCircle, AlertCircle } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  contactAddress?: string;
  trackingReference?: string;
  status: "pending" | "processing" | "shiping" | "shiped" | "cancelled";
  totalAmount: number;
  subtotal: number;
  shippingFee?: number;
  discount?: number;
  paymentMethod: string;
  shippingCarrier?: string;
  products?: Array<{
    id?: string;
    name?: string;
    title?: string;
    sku?: string;
    price?: number;
    quantity?: number;
    qty?: number;
  }>;
  createdAt: string;
  updatedAt: string;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.187:1337';

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { label: "Đang xử lý", icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
    processing: { label: "Xác nhận đơn hàng", icon: CheckCircle2, className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
    shiping: { label: "Đang giao hàng", icon: Truck, className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
    shiped: { label: "Đã nhận hàng", icon: CheckCircle2, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
    cancelled: { label: "Đã hủy", icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  };
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    credit_card: "Thẻ tín dụng",
    e_wallet: "Ví điện tử",
    cod: "COD",
  };
  return labels[method] || method;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  
  // For non-authenticated lookup
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Fetch orders for authenticated user
  const fetchMyOrders = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách đơn hàng");
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast.error(error.message || "Không thể lấy danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Lookup order by orderNumber + phone (for non-authenticated users)
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !phone.trim()) {
      setLookupError("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại");
      return;
    }

    setIsSearching(true);
    setLookupError("");
    
    try {
      const normalizedPhone = phone.replace(/\s+/g, "");
      const response = await fetch(
        `${API_URL}/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(normalizedPhone)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setLookupError("Không tìm thấy đơn hàng với thông tin đã cung cấp");
        } else {
          throw new Error("Không thể tra cứu đơn hàng");
        }
        return;
      }

      const data = await response.json();
      if (data.data) {
        setOrders([data.data]);
        setOrderNumber("");
        setPhone("");
        toast.success("Tìm thấy đơn hàng!");
      }
    } catch (error: any) {
      console.error("Error looking up order:", error);
      setLookupError(error.message || "Không thể tra cứu đơn hàng");
      toast.error("Không thể tra cứu đơn hàng");
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-lookup order from localStorage (for recent orders in same session)
  const autoLookupOrder = useCallback(async () => {
    const savedOrderNumber = localStorage.getItem("lastOrderNumber");
    const savedPhone = localStorage.getItem("lastOrderPhone");
    const savedTimestamp = localStorage.getItem("lastOrderTimestamp");

    // Check if saved order is within 24 hours
    if (savedOrderNumber && savedPhone && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp);
      const hoursSinceOrder = (Date.now() - timestamp) / (1000 * 60 * 60);
      
      if (hoursSinceOrder < 24) {
        // Auto lookup the order
        setOrderNumber(savedOrderNumber);
        setPhone(savedPhone);
        setIsSearching(true);
        setLookupError("");
        
        try {
          const normalizedPhone = savedPhone.replace(/\s+/g, "");
          const response = await fetch(
            `${API_URL}/api/orders/lookup?orderNumber=${encodeURIComponent(savedOrderNumber)}&phone=${encodeURIComponent(normalizedPhone)}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              setOrders([data.data]);
              toast.success("Đã tự động tải đơn hàng của bạn!");
              // Clear saved order info after successful lookup
              localStorage.removeItem("lastOrderNumber");
              localStorage.removeItem("lastOrderPhone");
              localStorage.removeItem("lastOrderTimestamp");
            }
          }
        } catch (error: any) {
          // Silently fail - user can manually lookup
          console.error("Auto lookup failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Clear expired saved order
        localStorage.removeItem("lastOrderNumber");
        localStorage.removeItem("lastOrderPhone");
        localStorage.removeItem("lastOrderTimestamp");
      }
    }
  }, []);

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchMyOrders();
    } else {
      // Try auto-lookup for non-authenticated users
      autoLookupOrder();
    }
  }, [isAuthenticated, token, fetchMyOrders, autoLookupOrder]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  return (
    <Container className="py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">
            {isAuthenticated 
              ? "Theo dõi và xem chi tiết các đơn hàng của bạn"
              : "Tra cứu đơn hàng của bạn bằng mã đơn hàng và số điện thoại"}
          </p>
        </div>

        {/* Authentication Status */}
        {isAuthenticated ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Xin chào, {user?.username || user?.email || "Khách hàng"}!</p>
                <p className="text-sm text-muted-foreground">
                  Bạn đang xem tất cả đơn hàng của tài khoản này
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push("/profile")}>
                Xem hồ sơ
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bạn chưa đăng nhập</p>
                <p className="text-sm text-muted-foreground">
                  Đăng nhập để xem tất cả đơn hàng của bạn hoặc tra cứu đơn hàng bằng mã đơn hàng
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Đăng nhập
              </Button>
            </div>
          </div>
        )}

        {/* Lookup Form (for non-authenticated users) */}
        {!isAuthenticated && (
          <Card>
            <CardHeader>
              <CardTitle>Tra cứu đơn hàng</CardTitle>
              <CardDescription>
                Nhập mã đơn hàng và số điện thoại để xem thông tin đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Mã đơn hàng *</Label>
                  <Input
                    id="orderNumber"
                    placeholder="VD: ORD-1"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    disabled={isSearching}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSearching}
                  />
                </div>
                {lookupError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{lookupError}</p>
                  </div>
                )}
                <Button type="submit" disabled={isSearching} className="w-full">
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tìm kiếm...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Tra cứu đơn hàng
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Đang tải...</span>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isAuthenticated ? "Chưa có đơn hàng nào" : "Chưa tìm thấy đơn hàng"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isAuthenticated 
                  ? "Các đơn hàng của bạn sẽ hiển thị ở đây"
                  : "Nhập mã đơn hàng và số điện thoại để tra cứu"}
              </p>
              {!isAuthenticated && (
                <Button onClick={() => router.push("/products")}>
                  Mua sắm ngay
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const StatusIcon = statusBadge.icon;

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Đơn hàng {order.orderNumber}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customerPhone}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className={statusBadge.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Summary */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Khách hàng:</span>
                          <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phương thức thanh toán:</span>
                          <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                        </div>
                        {order.trackingReference && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Mã vận đơn:</span>
                            <p className="font-medium font-mono">{order.trackingReference}</p>
                          </div>
                        )}
                      </div>

                      {/* Products Summary */}
                      {order.products && order.products.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Sản phẩm ({order.products.length})</p>
                          <div className="space-y-1">
                            {order.products.slice(0, 3).map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>
                                  {product.title || product.name} x {product.quantity || product.qty || 1}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatCurrencyVND((product.price || 0) * (product.quantity || product.qty || 1))}
                                </span>
                              </div>
                            ))}
                            {order.products.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                và {order.products.length - 3} sản phẩm khác...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex items-center justify-between border-t pt-4">
                        <span className="font-semibold">Tổng tiền:</span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrencyVND(order.totalAmount)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Chi tiết đơn hàng {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  Ngày đặt: {formatDate(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-2">Trạng thái</h3>
                  {(() => {
                    const statusBadge = getStatusBadge(selectedOrder.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <Badge className={statusBadge.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusBadge.label}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Tên:</span> {selectedOrder.customerName}</p>
                    <p><span className="text-muted-foreground">SĐT:</span> {selectedOrder.customerPhone}</p>
                    {selectedOrder.contactAddress && (
                      <p><span className="text-muted-foreground">Địa chỉ:</span> {selectedOrder.contactAddress}</p>
                    )}
                  </div>
                </div>

                {/* Products */}
                {selectedOrder.products && selectedOrder.products.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Sản phẩm</h3>
                    <div className="space-y-2">
                      {selectedOrder.products.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{product.title || product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Số lượng: {product.quantity || product.qty || 1}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrencyVND((product.price || 0) * (product.quantity || product.qty || 1))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrencyVND(product.price || 0)} / sản phẩm
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Tổng kết đơn hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tạm tính:</span>
                      <span>{formatCurrencyVND(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.shippingFee && selectedOrder.shippingFee > 0 && (
                      <div className="flex justify-between">
                        <span>Phí vận chuyển:</span>
                        <span>{formatCurrencyVND(selectedOrder.shippingFee)}</span>
                      </div>
                    )}
                    {selectedOrder.discount && selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrencyVND(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-semibold text-lg">
                      <span>Tổng tiền:</span>
                      <span className="text-primary">{formatCurrencyVND(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment & Shipping */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Thanh toán</h3>
                    <p className="text-sm">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                  </div>
                  {selectedOrder.trackingReference && (
                    <div>
                      <h3 className="font-semibold mb-2">Vận đơn</h3>
                      <p className="text-sm font-mono">{selectedOrder.trackingReference}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
