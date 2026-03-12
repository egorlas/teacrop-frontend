"use client";

import Link from "next/link";
import {
  Store,
  Smartphone,
  Facebook,
  Instagram,
  Bell,
  HelpCircle,
  Globe,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TopBar() {
  return (
    <div className="bg-gradient-to-r from-pink-300 to-rose-300 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="#"
            className="flex items-center gap-1 hover:opacity-90"
            aria-label="Kênh đối tác"
          >
            <Store className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Kênh người bán</span>
          </Link>
          <span className="hidden text-white/70 sm:inline">|</span>
          <Link href="#" className="hover:opacity-90">
            Trở thành người bán
          </Link>
          <span className="hidden text-white/70 sm:inline">|</span>
          <Link href="#" className="flex items-center gap-1 hover:opacity-90">
            <Smartphone className="h-3.5 w-3.5" />
            Tải ứng dụng
          </Link>
          <span className="hidden text-white/70 sm:inline">|</span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Kết nối</span>
            <Link href="#" className="hover:opacity-90" aria-label="Facebook">
              <Facebook className="h-3.5 w-3.5" />
            </Link>
            <Link href="#" className="hover:opacity-90" aria-label="Instagram">
              <Instagram className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="#"
            className="flex items-center gap-1 hover:opacity-90"
            aria-label="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Thông báo</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-1 hover:opacity-90"
            aria-label="Help"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hỗ trợ</span>
          </Link>
          <Select defaultValue="vi">
            <SelectTrigger className="h-6 w-auto border-0 bg-transparent px-1.5 py-0 text-white shadow-none focus:ring-0 [&>svg]:text-white">
              <Globe className="mr-1 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="flex items-center gap-1 hover:opacity-90"
            >
              <LogIn className="h-3.5 w-3.5" />
              Đăng nhập
            </Link>
            <span className="text-white/70">/</span>
            <Link
              href="/signup"
              className="flex items-center gap-1 hover:opacity-90"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
