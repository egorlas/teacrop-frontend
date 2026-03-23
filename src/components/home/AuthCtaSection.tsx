"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { useAuthStore } from "@/store/auth";

type AuthCtaSectionProps = {
  inline?: boolean;
};

export function AuthCtaSection({ inline = false }: AuthCtaSectionProps) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  if (isAuthenticated) {
    const content = (
      <div className="flex items-center justify-end gap-3 py-2 text-xs text-slate-700">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[0.75rem] shadow-sm hover:bg-rose-50"
          >
            <span className="hidden md:inline text-slate-500">
              Xin chào,{" "}
              <span className="font-semibold">
                {user?.username || user?.email}
              </span>
            </span>
            <span className="md:hidden font-semibold">
              {user?.username?.charAt(0) ?? user?.email?.charAt(0) ?? "U"}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>
          {open && (
            <div className="absolute right-0 z-30 mt-2 w-44 rounded-md border border-rose-100 bg-white py-1 text-xs shadow-lg">
              <Link
                href="/profile"
                className="block px-3 py-2 hover:bg-rose-50"
                onClick={() => setOpen(false)}
              >
                Quản lý hồ sơ
              </Link>
              <Link
                href="/orders"
                className="block px-3 py-2 hover:bg-rose-50"
                onClick={() => setOpen(false)}
              >
                Đơn hàng của tôi
              </Link>
              <Link
                href="/cart"
                className="block px-3 py-2 hover:bg-rose-50"
                onClick={() => setOpen(false)}
              >
                Giỏ hàng của tôi
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="block w-full px-3 py-2 text-left text-rose-500 hover:bg-rose-50"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    );

    if (inline) return content;

    return (
      <section className="border-b border-rose-100 bg-[#fbfbfb]">
        <Container>
          {content}
        </Container>
      </section>
    );
  }

  const guestContent = (
    <div className="flex items-center justify-end gap-3 py-2 text-xs text-slate-700">
      <span className="hidden md:inline text-slate-500">
        Đăng nhập để theo dõi đơn hàng và ưu đãi
      </span>
      <Link
        href="/signup"
        className="text-rose-500 hover:text-rose-600"
      >
        Đăng ký
      </Link>
      <span className="h-3 w-px bg-slate-300" />
      <Link
        href="/login"
        className="text-rose-500 hover:text-rose-600"
      >
        Đăng nhập
      </Link>
    </div>
  );

  if (inline) return guestContent;

  return (
    <section className="border-b border-rose-100 bg-[#fbfbfb]">
      <Container>
        {guestContent}
      </Container>
    </section>
  );
}

