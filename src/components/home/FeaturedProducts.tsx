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
      ? mockProducts.slice(0, 5)
      : [...mockProducts].slice(-5).reverse();

  return (
    <section className="bg-white py-20 text-slate-800">
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
                    ? "border-slate-700 text-slate-900"
                    : "border-transparent hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="grid gap-4 md:grid-cols-5">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <Image
                  src={product.image || "/placeholder-product.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
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
                  <span className="text-[11px] text-slate-500">
                    50g • 100g
                  </span>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-slate-800 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
          >
            View all
          </Link>
        </div>
      </Container>
    </section>
  );
}

