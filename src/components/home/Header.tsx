"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { Container } from "@/components/Container";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-pink-300 to-rose-300 py-3">
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Tea Love - Home"
          >
            <span className="font-audiowide text-[48px] font-bold leading-none text-white">Tea Love</span>
          </Link>
          <SearchBar />
          <Link
            href="/products"
            className="flex shrink-0 items-center justify-center gap-1 rounded-sm bg-white/20 px-4 py-2 text-white transition-colors hover:bg-white/30"
            aria-label="Cart"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="text-sm font-medium">Giỏ hàng</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
