type TeaFeelingIntroProps = {
  className?: string;
};

export function TeaFeelingIntro({ className }: TeaFeelingIntroProps) {
  return (
    <header
      className={`relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-emerald-950/95 via-emerald-900/90 to-stone-900/95 px-6 py-10 text-emerald-50 shadow-[0_24px_80px_-24px_rgba(6,78,59,0.55)] sm:px-10 sm:py-12 ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl"
      />
      <div className="relative max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/90">
          Tea Feeling
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Gợi ý trà theo tâm trạng &amp; thời tiết
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-emerald-100/90 sm:text-base">
          Chọn một ô trên lưới: trục dọc là cảm xúc / không gian bạn đang ở, trục ngang là thời tiết
          quanh bạn. Mỗi ô là một tổ hợp duy nhất — 36 lựa chọn trà được chọn để hợp nhịp với khoảnh
          khắc đó.
        </p>
      </div>
    </header>
  );
}
