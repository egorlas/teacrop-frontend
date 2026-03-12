"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchKeywords } from "./data";

export function SearchBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isProductsPage = pathname?.startsWith("/products");
  const currentSearch = isProductsPage ? (searchParams?.get("search") ?? "") : "";

  const searchAction = "/products";

  return (
    <div className="w-full max-w-[600px] flex-1">
      <form action={searchAction} method="get" className="flex rounded-sm bg-white shadow-sm">
        <input
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Tìm trà yêu thích, ấm trà, quà tặng..."
          className="flex-1 rounded-l-sm border-0 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
          aria-label="Search"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-r-sm bg-pink-400 px-4 py-2.5 text-white transition-colors hover:bg-pink-300"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Tìm kiếm</span>
        </button>
      </form>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {searchKeywords.slice(0, 5).map((kw) => (
          <Link
            key={kw}
            href={`/products?search=${encodeURIComponent(kw)}`}
            className="rounded bg-white/80 px-2 py-0.5 text-xs text-gray-600 hover:bg-white hover:text-pink-500"
          >
            {kw}
          </Link>
        ))}
      </div>
    </div>
  );
}
