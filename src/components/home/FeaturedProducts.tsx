"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/Container";
import { mockProducts } from "@/data/products";

const TABS = [
  { id: "new", label: "new arrivals" },
  { id: "best", label: "best sellers" },
];

export function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<"new" | "best">("new");

  const products =
    activeTab === "new"
      ? mockProducts.slice(0, 4)
      : [...mockProducts].slice(-4).reverse();

  return (
    <section className="border-y border-emerald-100 bg-[#fdfcfb] py-12 text-slate-900">
      <Container>
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "new" | "best")}
                className={`border-b pb-1.5 transition-colors ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-slate-900"
                    : "border-transparent hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="relative mx-auto mt-4 h-40 w-40">
                <div className="absolute inset-0 rounded-full bg-emerald-50" />
                <div className="relative z-10 h-full w-full overflow-hidden rounded-full">
                  <Image
                    src={product.image || "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500">
                  black | oolong | green
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {product.note}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-700">
                  <span>{(product.price / 1000).toFixed(0)}k</span>
                  <span className="text-[11px] text-emerald-600">
                    50g • 100g
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-300/60 transition hover:bg-emerald-700"
          >
            View all
          </Link>
        </div>
      </Container>
    </section>
  );
}

