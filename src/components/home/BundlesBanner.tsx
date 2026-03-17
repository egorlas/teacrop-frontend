"use client";

import Link from "next/link";
import Image from "next/image";

export function BundlesBanner() {
  return (
    <section className="relative border-y border-pink-200 bg-pink-200 py-6 md:py-8">
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[16/6] w-full md:aspect-[16/4.5] lg:aspect-[16/4]">
          <Image
            src="https://placehold.co/1920x600/ff8fb8/ffffff?text=Tea+Love+Bundles+Background"
            alt="Tea Love bundles background"
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-black/5" />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 py-8 md:px-10 lg:px-16">
              <div className="max-w-md text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  Tea Love bundles
                </p>
                <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                  Đóng gói{" "}
                  <span className="block text-lime-200">
                    tinh tế, tiết kiệm hơn
                  </span>
                </h2>
                <p className="mt-3 text-sm text-pink-50/90 md:text-base">
                  Kết hợp những loại trà bạn yêu thích thành combo quà tặng
                  xinh đẹp – giá tốt hơn, trải nghiệm trọn vẹn hơn.
                </p>
                <div className="mt-5">
                  <Link
                    href="/products?tag=bundle"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/60 transition hover:bg-emerald-600"
                  >
                    Shop bundles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

