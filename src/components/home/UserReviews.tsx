"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/Container";

const REVIEWS = [
  {
    id: 1,
    name: "Lan Anh",
    role: "Khách hàng thân thiết",
    content:
      "Trà của Tea Love rất thơm và dễ uống, đóng gói đẹp nên mình hay mua làm quà tặng.",
  },
  {
    id: 2,
    name: "Minh Khoa",
    role: "Yêu trà Việt",
    content:
      "Mình thích nhất là các dòng trà sen và trà ô long, hương vị rõ và hậu vị kéo dài.",
  },
  {
    id: 3,
    name: "Thuỷ Tiên",
    role: "Tín đồ trà hoa",
    content:
      "Giao hàng nhanh, đóng gói cẩn thận. Trà hoa cúc và hoa lài uống buổi tối rất thư giãn.",
  },
  {
    id: 4,
    name: "Quang Huy",
    role: "Khách mua định kỳ",
    content:
      "Đặt trà mỗi tháng, chất lượng ổn định, mùi thơm dễ chịu, giá hợp lý.",
  },
  {
    id: 5,
    name: "Bích Ngọc",
    role: "Người mới uống trà",
    content:
      "Nhân viên tư vấn nhiệt tình, gợi ý được hương vị hợp với người mới bắt đầu.",
  },
];

export function UserReviews() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % REVIEWS.length),
      6000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="border-y border-rose-100 bg-white/90 py-10">
      <Container>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-400">
            user reviews
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Khách hàng nói gì về Tea Love
          </h2>
        </div>
        <div className="relative mx-auto max-w-3xl overflow-hidden">
          {REVIEWS.map((review, i) => (
            <figure
              key={review.id}
              className={`absolute inset-0 flex flex-col items-center px-4 text-center transition-all duration-500 ${
                i === index
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
            >
              <div className="mb-3 flex items-center justify-center">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-rose-100 sm:h-14 sm:w-14">
                  <Image
                    src={`https://placehold.co/80x80/fce7f3/f973a5?text=${encodeURIComponent(
                      review.name.charAt(0),
                    )}`}
                    alt={review.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                “{review.content}”
              </p>
              <figcaption className="mt-4 text-sm">
                <div className="font-semibold text-slate-900">
                  {review.name}
                </div>
                <div className="text-xs text-slate-500">{review.role}</div>
              </figcaption>
            </figure>
          ))}
          <div className="relative h-40 sm:h-32" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-5 bg-rose-400" : "w-2 bg-rose-200"
              }`}
              aria-label={`Xem đánh giá ${i + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

