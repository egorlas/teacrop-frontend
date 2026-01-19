"use client";

import { useState } from "react";
import { Settings, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/store/useChatStore";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { TestTube } from "lucide-react";
import { CartModal } from "@/components/cart/CartModal";

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const {
    customerName,
    customerPhone,
    rememberPreferences,
    setCustomerName,
    setCustomerPhone,
    setRememberPreferences,
    resetChat,
    messages,
    addToCart: addToChatCart, // Keep old cart for backward compatibility
  } = useChatStore();
  const { items: cartItems, addItem } = useCartStore();

  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone || "");
  const [remember, setRemember] = useState(rememberPreferences);

  const handleSave = () => {
    setCustomerName(name);
    setCustomerPhone(phone || undefined);
    setRememberPreferences(remember);
    toast.success("Đã lưu cài đặt");
    setOpen(false);
  };

  const handleResetChat = () => {
    if (confirm(t("settings.reset_confirm", "Bạn có chắc muốn xóa toàn bộ hội thoại?"))) {
      resetChat();
      toast.success("Đã xóa hội thoại");
    }
  };

  const handleExportChat = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `viettea-chat-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất chat");
  };

  const handleAddTestProducts = () => {
    const testProducts = [
      {
        id: "test-1",
        title: "Trà xanh Thái Nguyên cao cấp",
        price: 250000,
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
        variant: "Gói 100g",
        qty: 1,
      },
      {
        id: "test-2",
        title: "Trà hoa nhài Hà Nội",
        price: 180000,
        image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&q=80",
        variant: "Gói 200g",
        qty: 2,
      },
      {
        id: "test-3",
        title: "Trà đen Shan Tuyết",
        price: 320000,
        image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80",
        variant: "Gói 150g",
        qty: 1,
      },
    ];

    testProducts.forEach((product) => {
      addItem(product);
    });

    toast.success(`Đã thêm ${testProducts.length} sản phẩm test vào giỏ hàng`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t("settings.title", "Cài đặt")}>
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("settings.title", "Cài đặt")}</DialogTitle>
          <DialogDescription>Quản lý thông tin và tùy chọn của bạn</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("settings.name", "Tên hiển thị")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">{t("settings.phone", "Số điện thoại")} (tùy chọn)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="remember" className="cursor-pointer">
              {t("settings.remember", "Ghi nhớ sở thích")}
            </Label>
            <Switch id="remember" checked={remember} onCheckedChange={setRemember} />
          </div>
          <div className="border-t pt-4 space-y-2">
            <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen}>
              <Button variant="outline" className="w-full relative" onClick={() => setCartModalOpen(true)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Xem giỏ hàng
                {cartItems.length > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </CartModal>
            <Button
              variant="outline"
              onClick={handleAddTestProducts}
              className="w-full"
              title="Thêm sản phẩm test vào giỏ hàng để test tính năng"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Thêm sản phẩm test (cho test)
            </Button>
            <Button variant="outline" onClick={handleExportChat} className="w-full">
              {t("settings.export_chat", "Xuất chat (JSON)")}
            </Button>
            <Button variant="destructive" onClick={handleResetChat} className="w-full">
              {t("settings.reset_chat", "Xóa hội thoại")}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel", "Hủy")}
          </Button>
          <Button onClick={handleSave}>{t("common.save", "Lưu")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

