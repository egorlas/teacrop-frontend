"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";

const teaImages = [
  {
    src: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754659/strapi/DSCF_0255_4f912822f1.jpg",
    alt: "Trà xanh cao cấp",
  },
  {
    src: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754659/strapi/DSCF_0243_6f101070d9.jpg",
    alt: "Trà đen thơm ngon",
  },
  {
    src: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754659/strapi/DSCF_0247_898a41e840.jpg",
    alt: "Trà hoa nhài",
  },
  {
    src: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754659/strapi/DSCF_0209_60d94a62ab.jpg",
    alt: "Trà Việt Nam truyền thống",
  },
  {
    src: "https://res.cloudinary.com/dzepc9mrh/image/upload/v1768754658/strapi/DSCF_0239_b8f1560592.jpg",
    alt: "Trà Việt Nam truyền thống",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teaImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Slider Images */}
      <div className="absolute inset-0">
        {teaImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide ? "opacity-100" : "opacity-0",
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center py-20 sm:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              Trà Việt Nam Chất Lượng Cao
            </h1>
            <p className="mb-8 text-lg text-white/90 sm:text-xl drop-shadow-md">
              Khám phá hương vị đậm đà truyền thống với bộ sưu tập trà Việt Nam được chọn lọc
              kỹ lưỡng. Mỗi tách trà là một trải nghiệm tuyệt vời.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-lg"
              >
                Xem sản phẩm
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-lg"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {teaImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75",
            )}
            aria-label={`Đi tới slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

