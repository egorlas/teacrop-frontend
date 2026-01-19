"use client";

import { ShoppingCart, Search, ChevronDown, X, Plus, Trash2, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastContainer, type ToastProps } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getProducts } from "@/lib/api";
import { strapiClient } from "@/lib/strapi/strapiClient";
import type { Product } from "@/types/product";

// Client component doesn't support metadata export
// export const metadata: Metadata = {
//   title: "Create Order | Staff Area",
//   description: "Create a new order",
// };

interface SelectedProduct extends Product {
  quantity: number;
  selectedId: string; // Unique ID for each selected item (to allow same product multiple times)
}

export default function CreateOrderPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trackingReference, setTrackingReference] = useState("");
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { token } = useAuthStore();

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getProducts({ populate: "*" });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    }
    fetchProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProductDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    // Check if product already exists in selected products
    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.id === product.id
    );

    if (existingProductIndex >= 0) {
      // Product already exists, increase quantity
      setSelectedProducts(
        selectedProducts.map((p, index) =>
          index === existingProductIndex
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        )
      );
    } else {
      // Product doesn't exist, add new product
      const selectedId = `${product.id}-${Date.now()}-${Math.random()}`;
      const newSelectedProduct: SelectedProduct = {
        ...product,
        quantity: 1,
        selectedId,
      };
      setSelectedProducts([...selectedProducts, newSelectedProduct]);
    }

    setSearchQuery("");
    setIsProductDropdownOpen(false);
  };

  const handleRemoveProduct = (selectedId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.selectedId !== selectedId));
  };

  const handleUpdateQuantity = (selectedId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.selectedId === selectedId ? { ...p, quantity } : p
      )
    );
  };

  // Calculate subtotal from all selected products
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const subTotal = selectedProducts.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return sum + itemTotal;
      }, 0);
      setSubtotal(subTotal.toFixed(2));
    } else {
      setSubtotal("");
      setTotalAmount("");
    }
  }, [selectedProducts]);

  // Calculate total amount: subtotal + shipping fee - discount
  useEffect(() => {
    if (!subtotal) {
      setTotalAmount("");
      return;
    }

    const subtotalNum = parseFloat(subtotal) || 0;
    const shippingFeeNum = parseFloat(shippingFee) || 0;
    const discountNum = parseFloat(discount) || 0;

    const total = subtotalNum + shippingFeeNum - discountNum;
    setTotalAmount(Math.max(0, total).toFixed(2)); // Ensure total is not negative
  }, [subtotal, shippingFee, discount]);

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

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!customerName || !customerName.trim()) {
      addToast({
        variant: "destructive",
        title: "Lỗi xác thực",
        description: "Vui lòng nhập tên khách hàng",
      });
      return;
    }

    if (!customerPhone || !customerPhone.trim()) {
      addToast({
        variant: "destructive",
        title: "Lỗi xác thực",
        description: "Vui lòng nhập số điện thoại",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      addToast({
        variant: "destructive",
        title: "Lỗi xác thực",
        description: "Vui lòng chọn ít nhất một sản phẩm",
      });
      return;
    }

    if (!paymentMethod) {
      addToast({
        variant: "destructive",
        title: "Lỗi xác thực",
        description: "Vui lòng chọn phương thức thanh toán",
      });
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      addToast({
        variant: "destructive",
        title: "Lỗi xác thực",
        description: "Tổng tiền không hợp lệ",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        contactAddress: contactAddress.trim() || null,
        products: selectedProducts.map((product) => ({
          id: product.id,
          name: product.name || "",
          sku: product.sku || null,
          price: product.price || 0,
          quantity: product.quantity || 1,
        })),
        subtotal: parseFloat(subtotal),
        shippingFee: parseFloat(shippingFee || "0"),
        discount: parseFloat(discount || "0"),
        totalAmount: parseFloat(totalAmount),
        paymentMethod,
        shippingCarrier: shippingCarrier || null,
      };

      // Call API to create order
      const response = await strapiClient<{ data: any; meta: any }>(
        "/api/orders",
        {
          method: "POST",
          token,
          requiresAuth: true,
          body: JSON.stringify({ data: orderData }),
        }
      );

      // Success - Show order dialog
      setCreatedOrder(response.data);
      setShowOrderDialog(true);
      setShowTrackingInput(false);
      setTrackingReference("");
      
      addToast({
        variant: "default",
        title: "Thành công!",
        description: `Đơn hàng ${response.data?.orderNumber || ""} đã được tạo thành công.`,
      });

      // Reset form after success
      setTimeout(() => {
        setSelectedProducts([]);
        setSearchQuery("");
        setCustomerName("");
        setCustomerPhone("");
        setPaymentMethod("");
        setShippingFee("");
        setDiscount("");
        setShippingCarrier("");
        setContactAddress("");
        setSubtotal("");
        setTotalAmount("");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating order:", error);

      // Handle error
      let errorMessage = "Không thể tạo đơn hàng. Vui lòng thử lại.";
      let errorDetails = "";

      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        
        // Handle inventory errors
        if (errorData.message && errorData.message.includes('tồn kho')) {
          errorMessage = errorData.message;
          errorDetails = errorData.details || errorData.message;
          
          // If there are multiple errors, show all of them
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorDetails = errorData.errors.join('\n');
          }
        } else {
          errorMessage = errorData.message || errorMessage;
          errorDetails = errorData.details || "";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      addToast({
        variant: "destructive",
        title: "Lỗi tạo đơn hàng",
        description: errorDetails || errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Tạo đơn hàng</h1>
        </div>
        <p className="text-muted-foreground">
          Tạo đơn hàng mới cho khách hàng
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nhân viên */}
            <div>
              <Label htmlFor="staff" className="mb-2">
                Nhân viên
              </Label>
              <Input
                id="staff"
                type="text"
                value={user?.username || user?.email || ""}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tên nhân viên tạo đơn hàng (không thể chỉnh sửa)
              </p>
            </div>

            {/* Thông tin khách hàng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name" className="mb-2">
                  Tên khách hàng <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-name"
                  type="text"
                  placeholder="Nhập tên khách hàng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tên đầy đủ của khách hàng
                </p>
              </div>

              <div>
                <Label htmlFor="customer-phone" className="mb-2">
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={customerPhone}
                  onChange={(e) => {
                    // Chỉ cho phép số và các ký tự +, -, (, ), khoảng trắng
                    const value = e.target.value.replace(/[^\d+\-()\s]/g, "");
                    setCustomerPhone(value);
                  }}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Số điện thoại liên hệ của khách hàng
                </p>
              </div>
            </div>

            {/* Sản phẩm - Searchable Dropdown */}
            <div>
              <Label htmlFor="product" className="mb-2">
                Sản phẩm
              </Label>
              <div className="relative" ref={productDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="product"
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsProductDropdownOpen(true);
                    }}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    className="pl-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isProductDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown Results */}
                {isProductDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.length > 0 ? (
                      <div className="py-1">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleProductSelect(product)}
                            className="w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {product.name}
                                </p>
                                {product.sku && (
                                  <p className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                  </p>
                                )}
                                {product.price && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(product.price)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        {searchQuery ? "Không tìm thấy sản phẩm" : "Nhập để tìm kiếm sản phẩm"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Products List */}
              {selectedProducts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-sm font-medium mb-2 block">
                    Sản phẩm đã chọn ({selectedProducts.length})
                  </Label>
                  {selectedProducts.map((item) => {
                    const itemTotal = (item.price || 0) * (item.quantity || 1);
                    return (
                      <div
                        key={item.selectedId}
                        className="p-3 rounded-md border border-border bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {item.name}
                            </p>
                            {item.sku && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                SKU: {item.sku}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`quantity-${item.selectedId}`} className="text-xs whitespace-nowrap">
                                  Số lượng:
                                </Label>
                                <Input
                                  id={`quantity-${item.selectedId}`}
                                  type="number"
                                  min="1"
                                  value={item.quantity || 1}
                                  onChange={(e) => {
                                    const quantity = parseInt(e.target.value) || 1;
                                    handleUpdateQuantity(item.selectedId, quantity);
                                  }}
                                  className="w-20 h-8 text-sm"
                                />
                              </div>
                              {item.price && (
                                <div className="text-xs text-muted-foreground">
                                  <span>Đơn giá: </span>
                                  <span className="font-medium">
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                    }).format(item.price)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {item.price && (
                              <p className="text-sm font-semibold text-foreground mt-2">
                                Thành tiền:{" "}
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(itemTotal)}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.selectedId)}
                            className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedProducts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Nhập tên hoặc SKU để tìm kiếm và thêm sản phẩm vào đơn hàng
                </p>
              )}
            </div>

            {/* Địa chỉ liên hệ */}
            <div>
              <Label htmlFor="contact-address" className="mb-2">
                Địa chỉ liên hệ
              </Label>
              <Textarea
                id="contact-address"
                placeholder="Nhập địa chỉ giao hàng..."
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Địa chỉ nhận hàng của khách hàng
              </p>
            </div>

            {/* Đơn vị vận chuyển */}
            <div>
              <Label htmlFor="shipping-carrier" className="mb-2">
                Đơn vị vận chuyển
              </Label>
              <select
                id="shipping-carrier"
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Chọn đơn vị vận chuyển --</option>
                <option value="ghn">Giao Hàng Nhanh (GHN)</option>
                <option value="ghtk">Giao Hàng Tiết Kiệm (GHTK)</option>
                <option value="vtpost">Bưu Điện Việt Nam (ViettelPost)</option>
                <option value="jnt">J&T Express</option>
                <option value="ninjavan">Ninja Van</option>
                <option value="best_express">Best Express</option>
                <option value="dhl">DHL</option>
                <option value="fedex">FedEx</option>
                <option value="other">Khác</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Chọn đơn vị vận chuyển cho đơn hàng
              </p>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <Label htmlFor="payment-method" className="mb-2">
                Phương thức thanh toán
              </Label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Chọn phương thức thanh toán --</option>
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="credit_card">Thẻ tín dụng</option>
                <option value="e_wallet">Ví điện tử</option>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                TODO: Tích hợp với cổng thanh toán
              </p>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Tóm tắt đơn hàng
              </h3>
              
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span className="font-medium text-foreground">
                  {subtotal
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(subtotal))
                    : "0 ₫"}
                </span>
              </div>

              {/* Shipping Fee */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <Label htmlFor="shipping-fee" className="text-muted-foreground mb-0">
                    Phí vận chuyển:
                  </Label>
                  <Input
                    id="shipping-fee"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="w-32 h-8 text-sm text-right"
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-auto w-32 text-right">
                  {shippingFee
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(shippingFee) || 0)
                    : "0 ₫"}
                </p>
              </div>

              {/* Discount */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <Label htmlFor="discount" className="text-muted-foreground mb-0">
                    Giảm giá:
                  </Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-32 h-8 text-sm text-right"
                  />
                </div>
                <p className="text-xs text-muted-foreground ml-auto w-32 text-right">
                  {discount
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(parseFloat(discount) || 0)
                    : "0 ₫"}
                </p>
              </div>

              <div className="border-t border-border pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">
                    Tổng tiền:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {totalAmount
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(parseFloat(totalAmount))
                      : "0 ₫"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tổng tiền = Tạm tính + Phí vận chuyển - Giảm giá
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  selectedProducts.length === 0 ||
                  !customerName ||
                  !customerPhone ||
                  !paymentMethod
                }
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo đơn hàng"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedProducts([]);
                  setSearchQuery("");
                  setCustomerName("");
                  setCustomerPhone("");
                  setPaymentMethod("");
                  setShippingFee("");
                  setDiscount("");
                  setShippingCarrier("");
                  setContactAddress("");
                  setSubtotal("");
                  setTotalAmount("");
                }}
              >
                Hủy
              </Button>
            </div>

          </form>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && <ToastContainer toasts={toasts} />}

      {/* Order Success Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Đơn hàng đã được tạo thành công!
            </DialogTitle>
            <DialogDescription>
              Đơn hàng của bạn đã được tạo và đang được xử lý.
            </DialogDescription>
          </DialogHeader>

          {createdOrder && (
            <div className="space-y-6 py-4">
              {/* Order Number with Copy */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Mã đơn hàng
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-lg font-semibold">
                    {createdOrder.orderNumber || createdOrder.id || "N/A"}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const orderNumber = createdOrder.orderNumber || createdOrder.id || "";
                      try {
                        await navigator.clipboard.writeText(orderNumber);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (err) {
                        console.error("Failed to copy:", err);
                      }
                    }}
                    className="shrink-0"
                  >
                    {copied ? (
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
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Thông tin người nhận
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Tên khách hàng</Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {createdOrder.customerName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {createdOrder.customerPhone || "N/A"}
                      </p>
                    </div>
                    {createdOrder.contactAddress && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Địa chỉ</Label>
                        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                          {createdOrder.contactAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {showFullDetails && (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Chi tiết đơn hàng</h3>

                  {/* Products */}
                  {createdOrder.products && Array.isArray(createdOrder.products) && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Sản phẩm ({createdOrder.products.length})
                      </Label>
                      <div className="space-y-2">
                        {createdOrder.products.map((product: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {product.name || "N/A"}
                              </p>
                              {product.sku && (
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.sku}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-foreground">
                                {product.quantity || 1} ×{" "}
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(product.price || 0)}
                              </p>
                              <p className="text-xs font-semibold text-primary">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format((product.price || 0) * (product.quantity || 1))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính:</span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(createdOrder.subtotal || 0)}
                      </span>
                    </div>
                    {createdOrder.shippingFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Phí vận chuyển:</span>
                        <span className="font-medium text-foreground">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(createdOrder.shippingFee || 0)}
                        </span>
                      </div>
                    )}
                    {createdOrder.discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Giảm giá:</span>
                        <span className="font-medium text-destructive">
                          -{new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(createdOrder.discount || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      <span className="text-base font-semibold text-foreground">Tổng tiền:</span>
                      <span className="text-lg font-bold text-primary">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(createdOrder.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Shipping Info */}
                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Phương thức thanh toán</Label>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {createdOrder.paymentMethod === "cash" && "Tiền mặt"}
                        {createdOrder.paymentMethod === "bank_transfer" && "Chuyển khoản ngân hàng"}
                        {createdOrder.paymentMethod === "credit_card" && "Thẻ tín dụng"}
                        {createdOrder.paymentMethod === "e_wallet" && "Ví điện tử"}
                        {createdOrder.paymentMethod === "cod" && "Thanh toán khi nhận hàng (COD)"}
                        {!createdOrder.paymentMethod && "N/A"}
                      </p>
                    </div>
                    {createdOrder.shippingCarrier && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Đơn vị vận chuyển</Label>
                        <p className="text-sm font-medium text-foreground mt-1">
                          {createdOrder.shippingCarrier === "ghn" && "Giao Hàng Nhanh (GHN)"}
                          {createdOrder.shippingCarrier === "ghtk" && "Giao Hàng Tiết Kiệm (GHTK)"}
                          {createdOrder.shippingCarrier === "vtpost" && "Bưu Điện Việt Nam (ViettelPost)"}
                          {createdOrder.shippingCarrier === "jnt" && "J&T Express"}
                          {createdOrder.shippingCarrier === "ninjavan" && "Ninja Van"}
                          {createdOrder.shippingCarrier === "best_express" && "Best Express"}
                          {createdOrder.shippingCarrier === "dhl" && "DHL"}
                          {createdOrder.shippingCarrier === "fedex" && "FedEx"}
                          {createdOrder.shippingCarrier === "other" && "Khác"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="border-t border-border pt-4">
                    <Label className="text-xs text-muted-foreground">Trạng thái đơn hàng</Label>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          createdOrder.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : createdOrder.status === "processing"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : createdOrder.status === "shipped"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : createdOrder.status === "delivered"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {createdOrder.status === "pending" && "Đang chờ xử lý"}
                        {createdOrder.status === "processing" && "Đang xử lý"}
                        {createdOrder.status === "shipped" && "Đã gửi hàng"}
                        {createdOrder.status === "delivered" && "Đã giao hàng"}
                        {createdOrder.status === "cancelled" && "Đã hủy"}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Reference */}
                  <div className="border-t border-border pt-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Mã tham chiếu (Tracking Reference)
                    </Label>
                    {createdOrder.trackingReference ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm font-medium">
                          {createdOrder.trackingReference}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(createdOrder.trackingReference);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (err) {
                              console.error("Failed to copy:", err);
                            }
                          }}
                          className="shrink-0"
                        >
                          {copied ? (
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
                    ) : (
                      <div className="space-y-2">
                        {!showTrackingInput ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTrackingInput(true)}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm mã tham chiếu
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              type="text"
                              placeholder="Nhập mã tham chiếu (VD: GHN123456789)"
                              value={trackingReference}
                              onChange={(e) => setTrackingReference(e.target.value)}
                              className="font-mono"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={async () => {
                                  if (!trackingReference || !trackingReference.trim()) {
                                    addToast({
                                      variant: "destructive",
                                      title: "Lỗi",
                                      description: "Vui lòng nhập mã tham chiếu",
                                    });
                                    return;
                                  }

                                  setIsUpdatingTracking(true);
                                  try {
                                    const response = await strapiClient<{ data: any }>(
                                      `/api/orders/${createdOrder.id}/tracking-reference`,
                                      {
                                        method: "PUT",
                                        token,
                                        requiresAuth: true,
                                        body: JSON.stringify({
                                          data: { trackingReference: trackingReference.trim() },
                                        }),
                                      }
                                    );

                                    // Update createdOrder state with new tracking reference
                                    setCreatedOrder({
                                      ...createdOrder,
                                      trackingReference: response.data.trackingReference,
                                      status: response.data.status,
                                    });

                                    setShowTrackingInput(false);
                                    setTrackingReference("");

                                    addToast({
                                      variant: "default",
                                      title: "Thành công!",
                                      description: "Mã tham chiếu đã được cập nhật. Tồn kho đã được trừ tự động.",
                                    });
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
                                }}
                                disabled={isUpdatingTracking || !trackingReference.trim()}
                                className="flex-1"
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
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setShowTrackingInput(false);
                                  setTrackingReference("");
                                }}
                                disabled={isUpdatingTracking}
                              >
                                Hủy
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              ⚠️ Sau khi cập nhật mã tham chiếu, tồn kho sẽ tự động được trừ và trạng thái đơn hàng sẽ chuyển sang "Đã gửi hàng"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {createdOrder.id && (
                    <div className="border-t border-border pt-4">
                      <Label className="text-xs text-muted-foreground">ID đơn hàng</Label>
                      <p className="text-xs font-mono text-foreground mt-1">
                        {createdOrder.id}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* See More / See Less Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFullDetails(!showFullDetails)}
                  className="w-full"
                >
                  {showFullDetails ? (
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
                setShowOrderDialog(false);
                setShowFullDetails(false);
                setShowTrackingInput(false);
                setTrackingReference("");
                setCreatedOrder(null);
              }}
              className="w-full sm:w-auto"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
