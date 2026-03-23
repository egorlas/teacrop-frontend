"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
} from "lucide-react";

const MAIN_MENU = [
  {
    label: "Sản phẩm",
    items: [
      { href: "/products?category=tea", name: "Trà cao cấp", image: "https://placehold.co/72x72/f8b4d9/ffffff?text=Tea" },
      { href: "/products?category=gift", name: "Quà tặng trà", image: "https://placehold.co/72x72/f9a8d4/ffffff?text=Gift" },
      { href: "/products?category=tools", name: "Phụ kiện trà", image: "https://placehold.co/72x72/fbcfe8/7a284f?text=Tools" },
    ],
  },
  {
    label: "Dịch vụ",
    items: [
      { href: "/services?type=consulting", name: "Tư vấn chọn trà", image: "https://placehold.co/72x72/c4f1f9/134e4a?text=TV" },
      { href: "/services?type=events", name: "Set up sự kiện", image: "https://placehold.co/72x72/a7f3d0/064e3b?text=Event" },
      { href: "/services?type=gift", name: "Đóng gói quà tặng", image: "https://placehold.co/72x72/fde68a/78350f?text=Gift" },
    ],
  },
  {
    label: "Khóa học",
    items: [
      { href: "/course?level=basic", name: "Pha trà cơ bản", image: "https://placehold.co/72x72/bbf7d0/14532d?text=CB" },
      { href: "/course?level=advanced", name: "Pha trà nâng cao", image: "https://placehold.co/72x72/86efac/14532d?text=NC" },
      { href: "/course?level=latte", name: "Matcha Latte", image: "https://placehold.co/72x72/f5d0fe/701a75?text=ML" },
    ],
  },
  {
    label: "Về chúng tôi",
    items: [
      { href: "/about#story", name: "Câu chuyện thương hiệu", image: "https://placehold.co/72x72/fbcfe8/831843?text=Story" },
      { href: "/about#team", name: "Đội ngũ", image: "https://placehold.co/72x72/e9d5ff/4c1d95?text=Team" },
      { href: "/about#factory", name: "Xưởng sản xuất", image: "https://placehold.co/72x72/dbeafe/1e3a8a?text=Factory" },
    ],
  },
  {
    label: "Hỗ trợ",
    items: [
      { href: "/support?type=faq", name: "Câu hỏi thường gặp", image: "https://placehold.co/72x72/fef3c7/92400e?text=FAQ" },
      { href: "/support?type=shipping", name: "Vận chuyển", image: "https://placehold.co/72x72/ddd6fe/3730a3?text=Ship" },
      { href: "/support?type=policy", name: "Chính sách đổi trả", image: "https://placehold.co/72x72/fecaca/7f1d1d?text=Policy" },
    ],
  },
];

export function SearchBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="w-full flex-1">
      <nav
        className="relative flex items-center rounded-md bg-white px-1.5 py-1 sm:px-2 sm:py-1.5"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <ul className="flex min-w-0 flex-nowrap items-center gap-1 overflow-x-auto no-scrollbar">
          {MAIN_MENU.map((menu) => (
            <li key={menu.label} className="shrink-0">
              <button
                type="button"
                onMouseEnter={() => setActiveMenu(menu.label)}
                onClick={() =>
                  setActiveMenu((curr) => (curr === menu.label ? null : menu.label))
                }
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-lg font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                  <span>{menu.label}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <div
          className={`absolute left-1/2 top-full z-50 w-screen max-w-[100vw] -translate-x-1/2 border-y border-gray-200 bg-white shadow-lg transition-all duration-300 ease-out ${
            activeMenu
              ? "visible translate-y-0 opacity-100"
              : "invisible translate-y-1 opacity-0"
          }`}
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-3 gap-2 px-3 py-3">
            {MAIN_MENU.find((m) => m.label === activeMenu)?.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveMenu(null)}
                className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-rose-50"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
                <span className="text-lg font-semibold">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
