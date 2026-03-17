"use client";

import Image from "next/image";
import Link from "next/link";
import { brands } from "./data";
import { Container } from "@/components/Container";

export function BrandSlide() {
  const duplicated = [...brands, ...brands];

  return (
    <section className="border-b border-gray-200 bg-white py-8">
      <Container>
        <h2 className="mb-6 text-center text-lg font-semibold text-gray-800 sm:text-xl">
          Nhãn hàng đồng hành
        </h2>
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-brand-scroll gap-8">
            {duplicated.map((brand, i) => (
              <Link
                key={`brand-${brand.id}-${i}`}
                href={brand.href}
                className="flex shrink-0 flex-col items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 p-4 transition-all hover:border-pink-200 hover:bg-pink-50/50 hover:shadow-sm"
              >
                <div className="relative h-14 w-28">
                  <Image
                    src={
                      brand.logo ||
                      `https://placehold.co/120x60/f5f5f5/2d6a4f?text=${encodeURIComponent(
                        brand.name,
                      )}`
                    }
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="112px"
                    unoptimized
                  />
                </div>
                <span className="text-center text-xs font-medium text-gray-600">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
