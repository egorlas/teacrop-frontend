import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function TeaFeelingPromoSection() {
  return (
    <section
      aria-labelledby="tea-feeling-promo-heading"
      className="relative overflow-hidden border-y border-emerald-900/15 bg-gradient-to-br from-emerald-950 via-emerald-900/95 to-stone-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl space-y-4 text-emerald-50">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
              Trải nghiệm mới
            </p>
            <h2
              id="tea-feeling-promo-heading"
              className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl"
            >
              Chọn trà theo cảm xúc
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-emerald-100/90 sm:text-base">
              Ma trận 6×6 theo tâm trạng và thời tiết — mỗi ô là một gợi ý trà riêng. Tìm tách trà hợp
              đúng khoảnh khắc bạn đang sống.
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <Link
              href="/feeling"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
            >
              Mở Tea Feeling
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="text-center text-xs text-emerald-200/80 sm:text-left lg:text-right">
              Miễn phí · không cần đăng nhập
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
