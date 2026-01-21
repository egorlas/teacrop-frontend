"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, Trash2, Banknote, ArrowLeft, LogIn, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore, type PaymentMethod } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatCurrencyVND } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { SuccessTransactionDialog } from "./SuccessTransactionDialog";

type CartModalProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type CustomerInfo = {
  name: string;
  address: string;
  phone: string;
};

export function CartModal({ children, open, onOpenChange }: CartModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Customer info form state (for cash payment)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    address: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

  const { items, updateItemQty, removeItem, createTransaction, lastTransaction } = useCartStore();
  const { isAuthenticated, token, user } = useAuthStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal; // No tax/shipping for now

  // Auto-fill customer info when user is authenticated and dialog opens
  useEffect(() => {
    if (dialogOpen && isAuthenticated && user) {
      // Auto-fill name from username if not already filled
      if (!customerInfo.name.trim() && user.username) {
        setCustomerInfo((prev) => ({ ...prev, name: user.username }));
      }
      // Auto-fill phone if user has phone number
      if (!customerInfo.phone.trim() && user.phone) {
        setCustomerInfo((prev) => ({ ...prev, phone: user.phone || "" }));
      }
    }
  }, [dialogOpen, isAuthenticated, user?.username, user?.phone]); // Only depend on relevant fields

  const handleQtyChange = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      removeItem(id);
      toast.success("Đã xóa sản phẩm");
    } else {
      updateItemQty(id, newQty);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success("Đã xóa sản phẩm");
  };

  const validateCustomerInfo = (): boolean => {
    const errors: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!customerInfo.name.trim()) {
      errors.name = "Vui lòng nhập tên khách hàng";
    }

    if (!customerInfo.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ";
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else {
      // Validate Vietnamese phone number format
      const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
      const normalizedPhone = customerInfo.phone.replace(/\s+/g, "");
      if (!phoneRegex.test(normalizedPhone)) {
        errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678)";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async (method: PaymentMethod) => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // Validate customer info for cash payment
    if (method === "cash") {
      if (!validateCustomerInfo()) {
        toast.error("Vui lòng điền đầy đủ thông tin khách hàng");
        return;
      }
    }

    setIsProcessing(true);
    try {
      if (method === "cash") {
        // Call API for cash payment with customer info
        // Include auth token if user is logged in so backend can link order to customer
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("/api/agent/cash-payment", {
          method: "POST",
          headers,
          body: JSON.stringify({
            items: items.map((item) => ({
              id: item.id,
              title: item.title,
              price: item.price,
              qty: item.qty,
              variant: item.variant,
            })),
            total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
            customerInfo: {
              name: customerInfo.name.trim(),
              address: customerInfo.address.trim(),
              phone: customerInfo.phone.replace(/\s+/g, ""),
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Đặt hàng thất bại");
        }

        const data = await response.json();
        const orderNumber = data.orderNumber || data.order_id || data.id;
        const customerPhone = customerInfo.phone.replace(/\s+/g, "");

        // Save orderNumber and phone to localStorage for automatic lookup
        if (orderNumber && customerPhone) {
          localStorage.setItem("lastOrderNumber", orderNumber);
          localStorage.setItem("lastOrderPhone", customerPhone);
          // Set expiry (24 hours)
          localStorage.setItem("lastOrderTimestamp", Date.now().toString());
        }

        // Create transaction in store with orderNumber from API
        // Note: createTransaction already clears the cart, so we don't need to clear it again
        const transaction = await createTransaction(
          method, 
          undefined, 
          orderNumber
        );
        
        setShowSuccessDialog(true);
        toast.success("Đặt hàng thành công! Đơn hàng của bạn đang chờ xử lý.");
        
        // Reset form and payment method
        setCustomerInfo({ name: "", address: "", phone: "" });
        setFormErrors({});
        setSelectedPaymentMethod(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đặt hàng thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    setDialogOpen(false);
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 left-[50%]! top-[50%]! translate-x-[-50%]! translate-y-[-50%]!">
            <DialogHeader className="px-4 pt-4 pb-3 shrink-0 sm:px-6 sm:pt-6 sm:pb-4">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-5 w-5" />
                Giỏ hàng
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {items.length === 0 ? "Giỏ hàng trống" : `${items.length} sản phẩm`}
              </DialogDescription>
            </DialogHeader>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4 sm:px-6">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Giỏ hàng của bạn đang trống</p>
              </div>
            ) : (
              <>
                {/* Items list - Mobile: larger scroll area (50vh), Desktop: flex-1 */}
                {!selectedPaymentMethod && (
                  <ScrollArea 
                    className="flex-1 min-h-0 px-4 sm:px-6 max-h-[50vh] sm:max-h-none" 
                  >
                    <div className="space-y-3 pb-4 sm:space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 border border-border rounded-lg bg-card sm:gap-4 sm:p-4"
                        >
                          {item.image && (
                            <div className="relative w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 64px, 96px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base line-clamp-2">
                              {item.title}
                            </h4>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground mt-0.5">Biến thể: {item.variant}</p>
                            )}
                            <p className="text-xs font-medium text-primary mt-1 sm:text-sm">
                              {formatCurrencyVND(item.price)}
                            </p>
                            <div className="flex items-center gap-2 mt-2 sm:mt-3">
                              <div className="flex items-center gap-1 border border-border rounded-md">
                                <Button
                                  variant="ghost"
                                  className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                                  onClick={() => handleQtyChange(item.id, -1)}
                                >
                                  <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                <span className="min-w-6 text-center text-xs font-medium sm:min-w-8 sm:text-sm">
                                  {item.qty}
                                </span>
                                <Button
                                  variant="ghost"
                                  className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                                  onClick={() => handleQtyChange(item.id, 1)}
                                >
                                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                              <div className="flex-1" />
                              <div className="text-xs font-semibold sm:text-sm">
                                {formatCurrencyVND(item.price * item.qty)}
                              </div>
                              <Button
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive sm:h-8 sm:w-8"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className={`space-y-3 pt-3 pb-4 px-4 shrink-0 bg-background sm:space-y-4 sm:pt-4 sm:pb-6 sm:px-6 ${!selectedPaymentMethod ? 'border-t' : ''}`}>
                  {!selectedPaymentMethod && (
                    <>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span className="font-medium">{formatCurrencyVND(subtotal)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold sm:text-base">
                        <span>Tổng cộng:</span>
                        <span className="text-primary">{formatCurrencyVND(total)}</span>
                      </div>
                    </>
                  )}

                  {/* Order Form */}
                  {!selectedPaymentMethod ? (
                    <div className="pt-2">
                      <Button
                        variant="default"
                        onClick={() => setSelectedPaymentMethod("cash")}
                        className="w-full"
                        size="lg"
                      >
                        <Banknote className="mr-2 h-5 w-5" />
                        Đặt hàng
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      {/* Back Button */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedPaymentMethod(null);
                          setCustomerInfo({ name: "", address: "", phone: "" });
                          setFormErrors({});
                        }}
                        className="h-8 w-full text-xs sm:text-sm"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                      </Button>

                      {/* Order Details */}
                      {selectedPaymentMethod === "cash" && (
                        <div className="border border-border rounded-lg p-4 space-y-4">
                          <div className="flex items-center gap-3">
                            <Banknote className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">Đặt hàng</p>
                              <p className="text-xs text-muted-foreground">
                                Vui lòng điền thông tin khách hàng
                              </p>
                            </div>
                          </div>

                          {/* Customer Info Form */}
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="customer-name" className="text-xs sm:text-sm">
                                Tên khách hàng <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="customer-name"
                                type="text"
                                placeholder="Nhập tên khách hàng"
                                value={customerInfo.name}
                                onChange={(e) => {
                                  setCustomerInfo((prev) => ({ ...prev, name: e.target.value }));
                                  if (formErrors.name) {
                                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                                  }
                                }}
                                className={formErrors.name ? "border-destructive" : ""}
                                disabled={isProcessing}
                              />
                              {formErrors.name && (
                                <p className="text-xs text-destructive">{formErrors.name}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="customer-phone" className="text-xs sm:text-sm">
                                Số điện thoại <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="customer-phone"
                                type="tel"
                                placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                                value={customerInfo.phone}
                                onChange={(e) => {
                                  setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }));
                                  if (formErrors.phone) {
                                    setFormErrors((prev) => ({ ...prev, phone: undefined }));
                                  }
                                }}
                                className={formErrors.phone ? "border-destructive" : ""}
                                disabled={isProcessing}
                              />
                              {formErrors.phone && (
                                <p className="text-xs text-destructive">{formErrors.phone}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="customer-address" className="text-xs sm:text-sm">
                                Địa chỉ <span className="text-destructive">*</span>
                              </Label>
                              <Textarea
                                id="customer-address"
                                placeholder="Nhập địa chỉ giao hàng"
                                value={customerInfo.address}
                                onChange={(e) => {
                                  setCustomerInfo((prev) => ({ ...prev, address: e.target.value }));
                                  if (formErrors.address) {
                                    setFormErrors((prev) => ({ ...prev, address: undefined }));
                                  }
                                }}
                                className={formErrors.address ? "border-destructive" : ""}
                                disabled={isProcessing}
                                rows={3}
                              />
                              {formErrors.address && (
                                <p className="text-xs text-destructive">{formErrors.address}</p>
                              )}
                            </div>

                            {/* Login Suggestion for non-authenticated users */}
                            {!isAuthenticated && (
                              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                                <div className="flex items-start gap-2">
                                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                  <div className="flex-1 space-y-1.5">
                                    <p className="text-xs font-medium text-foreground">
                                      Đăng nhập để theo dõi đơn hàng tốt hơn
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Khi đăng nhập, bạn có thể xem lịch sử đơn hàng, theo dõi trạng thái vận chuyển và quản lý thông tin cá nhân một cách thuận tiện.
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      ✓ Giỏ hàng của bạn sẽ được giữ nguyên khi đăng nhập
                                    </p>
                                    <Link 
                                      href="/login"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        // Save current dialog state to restore after login
                                        // Cart items are already persisted in localStorage
                                        setDialogOpen(false);
                                        window.location.href = "/login";
                                      }}
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-1"
                                    >
                                      <LogIn className="h-3.5 w-3.5" />
                                      Đăng nhập ngay
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handlePayment("cash")}
                            disabled={isProcessing}
                            className="w-full"
                            size="lg"
                          >
                            {isProcessing ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

      {/* Success Dialog */}
      {lastTransaction && (
        <SuccessTransactionDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          transaction={lastTransaction}
          onClose={handleCloseSuccess}
        />
      )}
    </>
  );
}

