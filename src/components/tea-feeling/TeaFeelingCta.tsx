import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TeaFeelingCta() {
  return (
    <section className="rounded-2xl border border-amber-900/10 bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50/80 px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl space-y-2">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
            Mang hương vị này về nhà
          </h2>
          <p className="text-sm leading-relaxed text-stone-600 sm:text-base">
            Khám phá trà và phụ kiện pha trên cửa hàng — chọn blend gần với gợi ý của bạn hoặc nhờ
            tư vấn thêm.
          </p>
        </div>
        <Link
          href="/products"
          className={cn(
            buttonVariants({ size: "lg" }),
            "inline-flex h-12 shrink-0 gap-2 rounded-full border-0 bg-emerald-900 px-8 text-amber-50 hover:bg-emerald-950",
          )}
        >
          Đến cửa hàng
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
