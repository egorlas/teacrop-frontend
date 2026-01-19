"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyVND } from "@/lib/utils";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { CartModal } from "./CartModal";

export function MiniCart() {
  const { items, updateItemQty, removeItem } = useCartStore();
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

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

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    setCartModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      <Card className="flex h-full flex-col rounded-none border-0 border-l">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t("cart.title", "Giỏ hàng")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
              {t("cart.empty", "Giỏ hàng trống")}
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-lg border border-border p-3"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">Biến thể: {item.variant}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatCurrencyVND(item.price)} × {item.qty}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 border border-border rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleQtyChange(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.qty}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleQtyChange(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("cart.total", "Tổng tiền")}</span>
                  <span className="font-bold text-lg text-primary">{formatCurrencyVND(total)}</span>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={items.length === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thanh toán ngay
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cart Modal for Checkout */}
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
    </div>
  );
}

