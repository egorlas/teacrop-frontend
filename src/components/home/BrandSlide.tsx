"use client";

import Link from "next/link";
import { Container } from "@/components/Container";

export function BrandSlide() {
  const teas = [
    { id: "tra-xanh", name: "Trà xanh", href: "/products" },
    { id: "tra-den", name: "Trà đen", href: "/products" },
    { id: "tra-oolong", name: "Trà ô long", href: "/products" },
    { id: "tra-sen", name: "Trà sen", href: "/products" },
    { id: "tra-lai", name: "Trà lài", href: "/products" },
    { id: "matcha", name: "Matcha", href: "/products" },
    { id: "tra-cuc", name: "Trà hoa cúc", href: "/products" },
    { id: "hong-tra", name: "Hồng trà", href: "/products" },
    { id: "tra-trai-cay", name: "Trà trái cây", href: "/products" },
    { id: "tra-thao-moc", name: "Trà thảo mộc", href: "/products" },
  ];

  return (
    <section className="bg-white py-8">
      <Container>
        <h2 className="mb-6 text-center text-lg font-semibold text-gray-800 sm:text-xl">
          Danh sách các loại trà
        </h2>
        <div className="relative overflow-hidden">
          {/* 2 groups để nối đuôi mượt (không chớp/nhảy ở vòng lặp). */}
          <div className="flex w-max animate-brand-scroll">
            <div className="flex gap-8">
              {teas.map((tea) => (
                <Link
                  key={tea.id}
                  href={tea.href}
                  className="flex shrink-0 flex-col items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-4 transition-all hover:border-slate-300 hover:bg-slate-100 hover:shadow-sm"
                >
                  <span className="text-center text-lg font-medium text-gray-600">
                    {tea.name}
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex gap-8">
              {teas.map((tea) => (
                <Link
                  key={`${tea.id}-dup`}
                  href={tea.href}
                  className="flex shrink-0 flex-col items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-4 transition-all hover:border-slate-300 hover:bg-slate-100 hover:shadow-sm"
                >
                  <span className="text-center text-lg font-medium text-gray-600">
                    {tea.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
