"use client";

import { useState } from "react";
import { QrCode, Banknote } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyVND } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";
import { useCartStore, type PaymentMethod } from "@/store/cart";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import type { CartItem } from "@/types/chat";
import { SuccessTransactionDialog } from "./SuccessTransactionDialog";

type OrderSummaryProps = {
  items: CartItem[];
  total: number;
  onOrderCreated?: (orderId: string, paymentUrl?: string) => void;
};

export function OrderSummary({ items, total, onOrderCreated }: OrderSummaryProps) {
  const { clearCart } = useChatStore();
  const { createTransaction, lastTransaction, addItem } = useCartStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Convert chat store CartItem to cart store CartItem and add to cart
  const syncItemsToCartStore = () => {
    items.forEach((item) => {
      addItem({
        id: item.productId,
        title: item.name,
        price: item.price,
        image: item.image,
        qty: item.qty,
      });
    });
  };

  const handlePayment = async (method: PaymentMethod) => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsProcessing(true);
    try {
      // Sync items to cart store first
      syncItemsToCartStore();

      // Create transaction using cart store
      const transaction = await createTransaction(method);

      // Show success dialog
      setShowSuccessDialog(true);
      toast.success("Thanh toán thành công!");

      // Also call original API if provided (backward compatibility)
      if (onOrderCreated) {
        onOrderCreated(transaction.id, undefined);
      }

      // Clear chat store cart
      clearCart();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thanh toán thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("order.summary", "Tóm tắt đơn hàng")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span className="font-medium">{formatCurrencyVND(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between font-bold">
            <span>{t("order.total", "Tổng cộng")}</span>
            <span className="text-lg text-primary">{formatCurrencyVND(total)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          {/* Payment Methods */}
          {selectedPaymentMethod ? (
            <div className="w-full space-y-3">
              {/* QR Code Payment */}
              {selectedPaymentMethod === "qr" && (
                <div className="space-y-3">
                  <div className="flex justify-center bg-muted/50 rounded-lg p-4">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                      <div className="text-center">
                        <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">QR Code Demo</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePayment("qr")}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán QR"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="w-full"
                  >
                    Hủy
                  </Button>
                </div>
              )}

              {/* Cash Payment */}
              {selectedPaymentMethod === "cash" && (
                <div className="space-y-3">
                  <Button
                    onClick={() => handlePayment("cash")}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? "Đang xử lý..." : "Xác nhận đã nhận tiền mặt"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPaymentMethod(null)}
                    className="w-full"
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPaymentMethod("qr")}
                className="w-full"
                size="lg"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Thanh toán QR
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPaymentMethod("cash")}
                className="w-full"
                size="lg"
              >
                <Banknote className="mr-2 h-4 w-4" />
                Thanh toán tiền mặt
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

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
