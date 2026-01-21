"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Receipt, Calendar, Eye, Loader2, User, Package, Copy, Check, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToastContainer, type ToastProps } from "@/components/ui/toast";
import { strapiClient } from "@/lib/strapi/strapiClient";

interface Transaction {
  id: number;
  transactionNumber: string;
  order: {
    id: number;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    totalAmount?: number;
  };
  amount: number;
  paymentMethod: string;
  transactionDate: string;
  status: "completed" | "pending" | "failed" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    username?: string;
  };
}

interface TransactionsResponse {
  data: Transaction[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export default function TransactionsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetailDialog, setShowTransactionDetailDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        "pagination[page]": currentPage.toString(),
        "pagination[pageSize]": "20",
        sort: "transactionDate:desc",
      });

      // Add search filter if exists
      if (debouncedSearch.trim()) {
        params.append("filters[transactionNumber][$contains]", debouncedSearch.trim());
      }

      const response = await strapiClient<TransactionsResponse>(
        `/api/transactions?${params.toString()}`,
        {
          method: "GET",
          token,
          requiresAuth: true,
        }
      );

      setTransactions(response.data || []);
      setTotalPages(response.meta?.pagination?.pageCount || 1);
      setTotalTransactions(response.meta?.pagination?.total || 0);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      addToast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        label: "Hoàn thành",
      },
      pending: {
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        label: "Đang chờ",
      },
      failed: {
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        label: "Thất bại",
      },
      refunded: {
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        label: "Đã hoàn tiền",
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Handle refund
  const handleRefund = async () => {
    if (!selectedTransaction || !refundReason.trim()) {
      addToast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập lý do hoàn tiền",
      });
      return;
    }

    setIsProcessingRefund(true);
    try {
      const response = await strapiClient<{ data: Transaction }>(
        `/api/transactions/${selectedTransaction.id}/refund`,
        {
          method: "PUT",
          token,
          requiresAuth: true,
          body: JSON.stringify({
            data: {
              reason: refundReason.trim(),
              notes: refundNotes.trim() || undefined,
            },
          }),
        }
      );

      // Update transaction in list
      setTransactions((prev) =>
        prev.map((t) => (t.id === selectedTransaction.id ? response.data : t))
      );

      // Update view transaction if it's the same
      if (viewTransaction?.id === selectedTransaction.id) {
        setViewTransaction(response.data);
      }

      // Close dialog and reset form
      setShowRefundDialog(false);
      setSelectedTransaction(null);
      setRefundReason("");
      setRefundNotes("");

      addToast({
        variant: "default",
        title: "Thành công!",
        description: `Đã hoàn tiền cho giao dịch ${selectedTransaction.transactionNumber}. Tồn kho đã được hoàn lại tự động.`,
      });

      // Refresh transactions list
      fetchTransactions();
    } catch (error: any) {
      console.error("Error processing refund:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Không thể xử lý hoàn tiền. Vui lòng thử lại.";

      addToast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      });
    } finally {
      setIsProcessingRefund(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Quản lý giao dịch</h1>
        </div>
        <p className="text-muted-foreground">
          Xem và quản lý tất cả giao dịch. Tìm kiếm theo mã giao dịch hoặc mã đơn hàng.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Label htmlFor="search" className="mb-2 block">
          Tìm kiếm giao dịch
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Tìm kiếm theo mã giao dịch hoặc mã đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {debouncedSearch && (
          <p className="text-xs text-muted-foreground mt-2">
            Tìm thấy {totalTransactions} giao dịch với từ khóa "{debouncedSearch}"
          </p>
        )}
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Đang tải danh sách giao dịch...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {debouncedSearch ? "Không tìm thấy giao dịch" : "Chưa có giao dịch nào"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {debouncedSearch
              ? "Thử tìm kiếm với từ khóa khác"
              : "Giao dịch sẽ xuất hiện ở đây khi đơn hàng chuyển sang trạng thái đã nhận hàng"}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Mã giao dịch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Hình thức thanh toán
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Ngày giao dịch
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-sm font-medium text-foreground">
                          {transaction.transactionNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {transaction.order ? (
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                              {transaction.order.orderNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {transaction.order ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {transaction.order.customerName}
                            </div>
                            {transaction.order.customerPhone && (
                              <div className="text-xs text-muted-foreground">
                                {transaction.order.customerPhone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-primary">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(transaction.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(transaction.transactionDate || transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewTransaction(transaction);
                              setShowTransactionDetailDialog(true);
                            }}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Xem
                          </Button>
                          {transaction.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setRefundReason("");
                                setRefundNotes("");
                                setShowRefundDialog(true);
                              }}
                              className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Hoàn tiền
                            </Button>
                          )}
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
                Trang {currentPage} / {totalPages} ({totalTransactions} giao dịch)
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

      {/* Transaction Detail Dialog */}
      <Dialog open={showTransactionDetailDialog} onOpenChange={setShowTransactionDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Chi tiết giao dịch
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về giao dịch {viewTransaction?.transactionNumber}
            </DialogDescription>
          </DialogHeader>

          {viewTransaction && (
            <div className="space-y-4 py-4">
              {/* Transaction Number */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-muted-foreground">Mã giao dịch:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {viewTransaction.transactionNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => copyToClipboard(viewTransaction.transactionNumber)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Order */}
              {viewTransaction.order && (
                <div className="space-y-2 border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Đơn hàng:</span>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {viewTransaction.order.orderNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Khách hàng:</span>
                    <span className="text-sm text-foreground">{viewTransaction.order.customerName}</span>
                  </div>
                  {viewTransaction.order.customerPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Số điện thoại:</span>
                      <span className="text-sm text-foreground">
                        {viewTransaction.order.customerPhone}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-muted-foreground">Số tiền:</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(viewTransaction.amount)}
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Hình thức thanh toán:
                </span>
                <span className="text-sm text-foreground">
                  {getPaymentMethodLabel(viewTransaction.paymentMethod)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                {getStatusBadge(viewTransaction.status)}
              </div>

              {/* Transaction Date */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm font-medium text-muted-foreground">Ngày giao dịch:</span>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(viewTransaction.transactionDate || viewTransaction.createdAt)}
                </div>
              </div>

              {/* Created By */}
              {viewTransaction.createdBy && (
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-sm font-medium text-muted-foreground">Người tạo:</span>
                  <span className="text-sm text-foreground">
                    {viewTransaction.createdBy.username ||
                      `ID: ${viewTransaction.createdBy.id}`}
                  </span>
                </div>
              )}

              {/* Notes */}
              {viewTransaction.notes && (
                <div className="border-b border-border pb-3">
                  <span className="text-sm font-medium text-muted-foreground block mb-2">Ghi chú:</span>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{viewTransaction.notes}</p>
                </div>
              )}

              {/* Created At */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Ngày tạo:</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(viewTransaction.createdAt)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Hoàn tiền giao dịch
            </DialogTitle>
            <DialogDescription>
              Xác nhận hoàn tiền cho giao dịch {selectedTransaction?.transactionNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4 py-4">
              {/* Transaction Info */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Mã giao dịch:</span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {selectedTransaction.transactionNumber}
                  </span>
                </div>
                {selectedTransaction.order && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Đơn hàng:</span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {selectedTransaction.order.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Khách hàng:</span>
                      <span className="text-sm text-foreground">
                        {selectedTransaction.order.customerName}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Số tiền hoàn lại:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Hình thức thanh toán:
                  </span>
                  <span className="text-sm text-foreground">
                    {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950 p-3">
                <p className="text-xs text-orange-800 dark:text-orange-200">
                  <strong>Lưu ý:</strong> Hành động này sẽ:
                </p>
                <ul className="list-disc list-inside text-xs text-orange-800 dark:text-orange-200 mt-1 space-y-0.5">
                  <li>Cập nhật trạng thái giao dịch sang "Đã hoàn tiền"</li>
                  <li>Chuyển trạng thái đơn hàng sang "Đã hủy"</li>
                  <li>Tự động hoàn lại tồn kho</li>
                </ul>
              </div>

              {/* Refund Reason */}
              <div className="space-y-2">
                <Label htmlFor="refund-reason" className="text-sm font-medium">
                  Lý do hoàn tiền <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="refund-reason"
                  placeholder="Nhập lý do hoàn tiền (bắt buộc)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isProcessingRefund}
                />
              </div>

              {/* Refund Notes */}
              <div className="space-y-2">
                <Label htmlFor="refund-notes" className="text-sm font-medium">
                  Ghi chú (tùy chọn)
                </Label>
                <Textarea
                  id="refund-notes"
                  placeholder="Thêm ghi chú nếu cần"
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isProcessingRefund}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRefundDialog(false);
                setSelectedTransaction(null);
                setRefundReason("");
                setRefundNotes("");
              }}
              disabled={isProcessingRefund}
            >
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button
              onClick={handleRefund}
              disabled={isProcessingRefund || !refundReason.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isProcessingRefund ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Xác nhận hoàn tiền
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
