"use client";

import Link from "next/link";

export function BundlesBanner() {
  return (
    <section className="relative bg-[#f7f7f7] py-6 md:py-8">
      <div className="mx-auto flex min-h-[260px] w-full max-w-6xl items-center justify-center px-6 py-20 md:min-h-[320px] md:px-10 lg:min-h-[360px] lg:px-16">
        <div className="mx-auto max-w-md text-center text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Tea Love bundles
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            Đóng gói{" "}
            <span className="block text-slate-700">
              tinh tế, tiết kiệm hơn
            </span>
          </h2>
          <p className="mt-3 text-sm text-slate-600 md:text-base">
            Kết hợp những loại trà bạn yêu thích thành combo quà tặng
            xinh đẹp - giá tốt hơn, trải nghiệm trọn vẹn hơn.
          </p>
          <div className="mt-5 flex justify-center">
            <Link
              href="/products?tag=bundle"
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Shop bundles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

