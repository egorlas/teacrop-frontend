"use client";

import Image from "next/image";
import { Container } from "@/components/Container";

const routineCards = [
  {
    id: "cold-immunity",
    title: "Cold & immunity",
    image:
      "https://placehold.co/600x320/f97316/ffffff?text=Cold+%26+Immunity",
  },
  {
    id: "detox-cleanse",
    title: "Detox & cleanse",
    image:
      "https://placehold.co/600x320/22c55e/ffffff?text=Detox+%26+Cleanse",
  },
  {
    id: "sleep-relax",
    title: "Sleep & relax",
    image:
      "https://placehold.co/600x320/6366f1/ffffff?text=Sleep+%26+Relax",
  },
];

export function FeatureIcons() {
  return (
    <section className="border-b border-gray-200 bg-white py-10">
      <Container>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
            <span className="text-lg md:text-2xl font-bold text-pink-600 tracking-wide font-serif">
             Dayly Routine
            </span>
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {routineCards.map((card) => (
            <button
              key={card.id}
               type="button"
              className="group relative overflow-hidden rounded-3xl bg-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.25)] transition hover:-translate-y-1"
            >
              <div className="relative h-44 w-full md:h-56">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 360px"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20" />
                <div className="absolute inset-0 flex items-center px-6">
                  <p className="text-2xl font-extrabold uppercase tracking-tight text-yellow-300 md:text-3xl">
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
