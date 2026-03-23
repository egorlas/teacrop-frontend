"use client";

import { Suspense, useState } from "react";
import { SearchBar } from "@/components/home/SearchBar";
import { Container } from "@/components/Container";
import { Search, LogIn, LogOut, ShoppingCart, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

type HomeNavSearchProps = {
  inline?: boolean;
};

export function HomeNavSearch({ inline = false }: HomeNavSearchProps) {
  const { isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"search" | "auth" | "cart" | null>(null);

  const openPanel = (panel: "search" | "auth" | "cart") => {
    setActivePanel(panel);
    setIsSidebarOpen(true);
  };

  const content = (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        {/* Left: Category group */}
        <div className="min-w-0 flex-1">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Right: Function group */}
        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:ml-2">
          <button
            type="button"
            onClick={() => openPanel("search")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Tìm kiếm"
            title="Tìm kiếm"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openPanel("auth")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Tài khoản"
            title="Tài khoản"
          >
            {isAuthenticated ? <LogOut className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => openPanel("cart")}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Giỏ hàng"
            title="Giỏ hàng"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {items.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Right sidebar placeholder */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Đóng sidebar"
          />
          <aside className="absolute right-0 top-0 h-full w-[340px] max-w-full bg-white shadow-2xl sm:max-w-[88vw]">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-lg font-semibold text-slate-800">
                {activePanel === "search" && "Tìm kiếm"}
                {activePanel === "auth" && "Tài khoản"}
                {activePanel === "cart" && "Giỏ hàng"}
              </h3>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 text-lg text-slate-600">
              Placeholder sidebar cho chức năng{" "}
              <span className="font-medium text-slate-800">
                {activePanel === "search" && "Tìm kiếm"}
                {activePanel === "auth" && "Tài khoản"}
                {activePanel === "cart" && "Giỏ hàng"}
              </span>
              . Bạn sẽ bổ sung chi tiết sau.
            </div>
          </aside>
        </div>
      )}
    </>
  );

  if (inline) return content;

  return (
    <div className="bg-white">
      <Container>
        <div className="border-b border-gray-200 py-2 sm:py-3">
          {content}
        </div>
      </Container>
    </div>
  );
}

