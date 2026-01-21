"use client";

import { CheckCircle2, ExternalLink, Copy, Check } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
  const router = useRouter();
  const [copied, setCopied] = useState(false);

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

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      toast.success("Đã sao chép mã đơn hàng!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Không thể sao chép mã đơn hàng");
    }
  };

  const handleViewOrder = () => {
    onClose();
    // Redirect to orders page
    // Order will be automatically looked up from localStorage
    router.push("/orders");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {transaction.method === "cash" ? "Đặt hàng thành công!" : "Thanh toán thành công!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {transaction.method === "cash" 
              ? "Đơn hàng của bạn đã được tạo thành công và đang chờ xử lý"
              : "Giao dịch của bạn đã được xử lý thành công"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Number - Highlighted */}
          {transaction.method === "cash" && (
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Mã đơn hàng của bạn</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyOrderNumber}
                  className="h-7 px-2"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-primary">{transaction.id}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lưu mã này để tra cứu đơn hàng sau. Hoặc click "Xem trạng thái đơn hàng" để xem ngay.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {transaction.method !== "cash" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mã giao dịch:</span>
                <span className="font-mono font-medium">{transaction.id}</span>
              </div>
            )}
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

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {transaction.method === "cash" && (
            <Button
              variant="default"
              onClick={handleViewOrder}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Xem trạng thái đơn hàng
            </Button>
          )}
          <Button 
            variant={transaction.method === "cash" ? "outline" : "default"} 
            onClick={onClose} 
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

