"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/Container";
import { heroSlides } from "./data";
import { cn } from "@/lib/utils";

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <section className="border-b border-gray-200 bg-[#ff6fb5] text-white">
      <div className="bg-[linear-gradient(135deg,#ff6fb5,40%,#ffb347)]">
        <Container>
          <div className="grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:py-14 lg:py-16">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px]">
                  {heroSlides[currentSlide].badgePrefix}
                </span>
                <span>{heroSlides[currentSlide].badgeLabel}</span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">
                  {heroSlides[currentSlide].eyebrow}
                </p>
                <h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl lg:text-[52px]">
                  {heroSlides[currentSlide].headline}{" "}
                  <span className="block text-yellow-200">
                    {heroSlides[currentSlide].highlight}
                  </span>
                </h1>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-pink-50/90 md:text-base">
                {heroSlides[currentSlide].description}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={heroSlides[currentSlide].primaryHref}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-pink-600 shadow-md shadow-rose-300/60 transition hover:translate-y-0.5 hover:bg-pink-50"
                >
                  {heroSlides[currentSlide].primaryLabel}
                </a>
                <a
                  href={heroSlides[currentSlide].secondaryHref}
                  className="inline-flex items-center justify-center rounded-full border border-white/60 px-5 py-2.5 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/10"
                >
                  {heroSlides[currentSlide].secondaryLabel}
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto h-64 max-w-md rounded-[32px] bg-white/10 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur-sm md:h-72 lg:h-80">
                <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-pink-100">
                  {heroSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={cn(
                        "absolute inset-0 transition-opacity duration-700",
                        index === currentSlide ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 90vw, 540px"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute -left-6 bottom-6 hidden rotate-[-8deg] rounded-full bg-yellow-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-pink-700 shadow-sm md:block">
                  Sản phẩm mới
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-1.5">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      "h-1.5 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/80",
                      index === currentSlide ? "w-5 bg-white" : "w-1.5",
                    )}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
      <div className="border-t border-white/20 bg-[#00b4a5] text-[11px] text-white/95">
        <Container>
          <div className="relative overflow-hidden py-2.5">
            <div className="flex animate-[hero-ticker_18s_linear_infinite] items-center gap-8 whitespace-nowrap">
              <div className="inline-flex items-center gap-1.5">
                <span className="text-base leading-none">♥</span>
                <span>Đóng gói với tất cả sự tinh tế</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>+150 loại trà để khám phá</span>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>+50,000 lượt đánh giá từ khách hàng</span>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>Nguyên liệu chọn lọc từ nhà vườn</span>

              {/* duplicate content for seamless loop */}
              <div className="inline-flex items-center gap-1.5 pl-8">
                <span className="text-base leading-none">♥</span>
                <span>Đóng gói với tất cả sự tinh tế</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>+150 loại trà để khám phá</span>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>+50,000 lượt đánh giá từ khách hàng</span>
              <span className="h-1 w-1 rounded-full bg-white/70" />
              <span>Nguyên liệu chọn lọc từ nhà vườn</span>
            </div>
          </div>
        </Container>
      </div>
      <style jsx>{`
        @keyframes hero-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
