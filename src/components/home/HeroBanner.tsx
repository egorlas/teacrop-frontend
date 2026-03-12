"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { heroSlides, promoBanners } from "./data";
import { Container } from "@/components/Container";

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="border-b border-gray-200 bg-white">
      <Container>
        <div className="grid gap-3 py-3 md:grid-cols-[1fr_200px]">
          <div className="relative overflow-hidden rounded-md bg-gray-100">
            <div className="relative aspect-[840/320] w-full max-h-[320px] min-h-[180px]">
              {heroSlides.map((slide, i) => (
                <div
                  key={slide.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    i === currentSlide ? "opacity-100" : "opacity-0",
                  )}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 840px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentSlide
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/75",
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="hidden flex-col gap-3 md:flex">
            {promoBanners.map((banner) => (
              <a
                key={banner.id}
                href="#"
                className="block overflow-hidden rounded-md transition-opacity hover:opacity-95"
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  width={200}
                  height={100}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
