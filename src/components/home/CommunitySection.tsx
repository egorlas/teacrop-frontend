"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";

const CARDS = [
  {
    id: "ambassador",
    title: "be a tea ambassador",
    description:
      "Chia sẻ câu chuyện trà của bạn, lan toả cảm hứng thưởng trà và nhận ưu đãi dành riêng cho cộng đồng Tea Love.",
    ctaLabel: "Learn more",
    href: "/about",
    image:
      "https://placehold.co/640x360/38bdf8/ffffff?text=Tea+Ambassador",
  },
  {
    id: "loyalty",
    title: "frequent steeper program",
    description:
      "Tích điểm trên mỗi đơn hàng, đổi lấy trà miễn phí và quà tặng đặc biệt khi tham gia Tea Love Loyalty.",
    ctaLabel: "Learn more",
    href: "/profile",
    image:
      "https://placehold.co/640x360/06b6d4/ffffff?text=Tea+Loyalty+Program",
  },
];

export function CommunitySection() {
  return (
    <section className="bg-white py-10">
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <article
              key={card.id}
              className="overflow-hidden rounded-3xl bg-slate-50 shadow-[0_10px_35px_rgba(15,23,42,0.08)]"
            >
              <div className="relative h-48 w-full sm:h-56">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 520px"
                  unoptimized
                />
              </div>
              <div className="px-6 pb-6 pt-4">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className="mt-3 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900"
                >
                  {card.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

