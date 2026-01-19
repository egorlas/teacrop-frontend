"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Transaction } from "@/store/cart";
import { formatCurrencyVND } from "@/lib/utils";

type SuccessTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction;
  onClose: () => void;
};

export function SuccessTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onClose,
}: SuccessTransactionDialogProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paymentMethodLabel = {
    qr: "Thanh toán QR",
    cash: "Tiền mặt",
  };

  const totalItems = transaction.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Thanh toán thành công!</DialogTitle>
          <DialogDescription className="text-center">
            Giao dịch của bạn đã được xử lý thành công
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã giao dịch:</span>
              <span className="font-mono font-medium">{transaction.id}</span>
            </div>
            {transaction.userId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Người dùng:</span>
                <span className="font-medium">{transaction.userId}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phương thức:</span>
              <span className="font-medium">{paymentMethodLabel[transaction.method]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Số lượng sản phẩm:</span>
              <span className="font-medium">{totalItems} sản phẩm</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Tổng tiền:</span>
              <span className="text-primary">{formatCurrencyVND(transaction.amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Thời gian:</span>
              <span>{formatDate(transaction.createdAt)}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium">Chi tiết sản phẩm:</p>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-muted-foreground">x{item.qty}</span>
                  </div>
                  {item.variant && (
                    <div className="text-muted-foreground mt-1">Biến thể: {item.variant}</div>
                  )}
                  <div className="text-right mt-1 text-muted-foreground">
                    {formatCurrencyVND(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

