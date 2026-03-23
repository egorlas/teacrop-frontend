"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    id: "s1",
    bg: "#fff200",
    text: "#13a89e",
    title: "Tea Love Signature",
    headline: "Tinh hoa tra dao",
    subline: "trong khong gian tinh lang",
    description: "Kham pha bo suu tap tra va dung cu thuong tra duoc tuyen chon.",
  },
  {
    id: "s2",
    bg: "#13a89e",
    text: "#fff200",
    title: "Tea Love Collection",
    headline: "Bo suu tap cao cap",
    subline: "cho nguoi yeu tra",
    description: "Lua chon da dang cho moi phong cach thuong tra.",
  },
];

export function HomeHeroImageSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundColor: slide.bg }}
        />
      ))}

      <div className="relative">
        <div className="mx-auto flex min-h-[70vh] items-center justify-center px-6 py-12 text-center sm:px-10 lg:px-16">
          <div className="max-w-2xl" style={{ color: SLIDES[index].text }}>
            <p className="text-lg font-semibold uppercase tracking-[0.28em]">
              {SLIDES[index].title}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {SLIDES[index].headline}
              <span className="block">{SLIDES[index].subline}</span>
            </h2>
            <p className="mt-4 text-lg">
              {SLIDES[index].description}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-slate-800/80" : "w-2.5 bg-slate-800/40"
              }`}
              aria-label={`Chon slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

