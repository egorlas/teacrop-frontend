"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { TeaFeelingProductDetailDialog } from "@/components/tea-feeling/TeaFeelingProductDetailDialog";
import { cn } from "@/lib/utils";
import type { TeaFeelingProductItem } from "@/types/tea-feeling";

type TeaFeelingResultCardProps = {
  products: TeaFeelingProductItem[] | null;
  moodLabel: string | null;
  weatherLabel: string | null;
};

export function TeaFeelingResultCard({
  products,
  moodLabel,
  weatherLabel,
}: TeaFeelingResultCardProps) {
  const [detailProduct, setDetailProduct] = useState<TeaFeelingProductItem | null>(null);
  const hasProducts = products && products.length > 0;

  if (!hasProducts) {
    return (
      <Card className="border-emerald-900/10 bg-gradient-to-br from-stone-50 via-white to-emerald-50/30 shadow-[0_20px_60px_-28px_rgba(6,78,59,0.35)]">
        <CardHeader className="space-y-3 pb-2">
          <div className="inline-flex items-center gap-2 text-emerald-900/80">
            <Sparkles className="h-5 w-5 shrink-0 text-amber-600/90" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">Gợi ý trà</span>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-stone-600">
            Chọn một ô trên lưới — mỗi ô hiển thị{" "}
            <span className="font-medium text-emerald-900/90">danh sách trà gợi ý</span> phù hợp cảm
            xúc và thời tiết tại thời điểm đó.
          </p>
        </CardHeader>
        <CardContent className="rounded-xl border border-dashed border-emerald-900/15 bg-emerald-950/[0.03] px-5 py-8 text-center">
          <p className="text-sm text-stone-500">
            Chưa có lựa chọn — hãy chạm vào một ô để xem gợi ý.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-emerald-900/10 bg-gradient-to-br from-stone-50 via-white to-emerald-50/25 shadow-[0_24px_70px_-30px_rgba(6,78,59,0.4)]">
        <div className="border-b border-emerald-900/10 bg-gradient-to-r from-emerald-950/95 to-stone-900/95 px-5 py-4 text-emerald-50 sm:px-7 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90">
            Gợi ý cho thời điểm này
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Trà có thể dùng ngay
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-emerald-100/85 sm:text-sm">
            {moodLabel ? (
              <span className="rounded-full border border-white/15 px-3 py-1">{moodLabel}</span>
            ) : null}
            {weatherLabel ? (
              <span className="rounded-full border border-white/15 px-3 py-1">{weatherLabel}</span>
            ) : null}
            <span className="rounded-full bg-white/10 px-3 py-1 font-medium backdrop-blur">
              {products.length} gợi ý
            </span>
          </div>
        </div>

        <CardContent className="space-y-0 px-0 py-0">
          <ul className="divide-y divide-emerald-900/10">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-stretch sm:gap-4 sm:px-6 sm:py-5"
              >
                <button
                  type="button"
                  aria-label={`Xem chi tiết: ${p.name}`}
                  onClick={() => setDetailProduct(p)}
                  className="flex min-w-0 flex-1 gap-3 rounded-xl p-1 text-left outline-none transition hover:bg-emerald-950/[0.04] focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                >
                  <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-emerald-950/10 sm:h-24 sm:w-24">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-emerald-800/20">
                        <Sparkles className="size-8" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <span className="block text-base font-semibold leading-snug text-stone-900 sm:text-[17px]">
                      {p.name}
                    </span>
                    <span className="line-clamp-3 block text-pretty text-sm leading-relaxed text-stone-600 sm:text-[15px]">
                      {p.description}
                    </span>
                  </div>
                </button>
                <div className="flex shrink-0 items-center sm:items-end sm:justify-center">
                  <Link
                    href={p.orderHref}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "inline-flex h-9 gap-1.5 rounded-lg bg-emerald-900 px-4 text-amber-50 hover:bg-emerald-950 sm:h-10",
                    )}
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Gọi trà
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <TeaFeelingProductDetailDialog
        product={detailProduct}
        open={detailProduct !== null}
        onOpenChange={(o) => {
          if (!o) {
            setDetailProduct(null);
          }
        }}
      />
    </>
  );
}
