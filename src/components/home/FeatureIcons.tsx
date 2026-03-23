"use client";

import Image from "next/image";
import { Be_Vietnam_Pro } from "next/font/google";
import { Container } from "@/components/Container";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const routineCards = [
  {
    id: "tra",
    title: "Trà",
    bgColor: "#13a89e",
    image:
      "https://placehold.co/600x320/13a89e/ffffff?text=TRA",
  },
  {
    id: "tra-cu",
    title: "Trà Cụ",
    bgColor: "#d91b5c",
    image:
      "https://placehold.co/600x320/0ea5e9/ffffff?text=TRA+CU",
  },
  {
    id: "qua-tang",
    title: "Quà Tặng",
    bgColor: "#f1592a",
    image:
      "https://placehold.co/600x320/f97316/ffffff?text=QUA+TANG",
  },
];

export function FeatureIcons() {
  return (
    <section className={`${beVietnamPro.className} bg-white py-10`}>
      <Container>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
              <span className="text-lg md:text-2xl font-bold text-slate-700 tracking-wide">
              Danh Mục Sản Phẩm
            </span>
          </p>
        </div>
        <div className="max-w-3/4 mx-auto grid gap-4 md:grid-cols-3">
          {routineCards.map((card) => (
            <button
              key={card.id}
               type="button"
              className="group relative overflow-hidden rounded-3xl shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
              style={{ backgroundColor: card.bgColor }}
            >
              <div className="relative h-44 w-full md:h-56">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover grayscale transition duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 360px"
                  unoptimized
                />
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: card.bgColor, opacity: 1 }}
                />
                <div className="absolute inset-0 flex items-center justify-center px-6">
                  <p className="w-full text-2xl font-extrabold uppercase tracking-tight text-slate-100 md:text-3xl text-center">
                    {card.title}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
