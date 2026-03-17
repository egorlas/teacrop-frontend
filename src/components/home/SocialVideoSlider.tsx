"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Container } from "@/components/Container";

const VIDEOS = [
  {
    id: "v1",
    title: "Cách pha trà sữa ô long",
    thumbnail:
      "https://placehold.co/320x560/f97316/ffffff?text=Tea+Video+1",
    url: "https://www.youtube.com/watch?v=video-1",
  },
  {
    id: "v2",
    title: "Cold brew trà xanh cam chanh",
    thumbnail:
      "https://placehold.co/320x560/22c55e/ffffff?text=Tea+Video+2",
    url: "https://www.youtube.com/watch?v=video-2",
  },
  {
    id: "v3",
    title: "Trà hoa cúc mật ong ấm",
    thumbnail:
      "https://placehold.co/320x560/facc15/000000?text=Tea+Video+3",
    url: "https://www.youtube.com/watch?v=video-3",
  },
  {
    id: "v4",
    title: "Latte matcha béo mịn",
    thumbnail:
      "https://placehold.co/320x560/38bdf8/ffffff?text=Tea+Video+4",
    url: "https://www.youtube.com/watch?v=video-4",
  },
  {
    id: "v5",
    title: "Trà trái cây nhiệt đới",
    thumbnail:
      "https://placehold.co/320x560/ec4899/ffffff?text=Tea+Video+5",
    url: "https://www.youtube.com/watch?v=video-5",
  },
];

export function SocialVideoSlider() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeVideo = useMemo(
    () => VIDEOS.find((v) => v.id === activeId) ?? null,
    [activeId],
  );

  const getEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    );
    if (!match) return url;
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  };

  const scrollByCards = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLButtonElement>("button[data-card]");
    const cardWidth = card?.offsetWidth ?? 220;
    const gap = 16;
    const delta = (cardWidth + gap) * 2; // scroll ~2 cards

    track.scrollBy({
      left: direction === "left" ? -delta : delta,
      behavior: "smooth",
    });
  };

  return (
    <section className="border-y border-slate-100 bg-white py-10">
      <Container>
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
            sip and scroll on social
          </p>
        </div>
        <div className="relative">
          <div className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
            <div
              ref={trackRef}
              className="flex justify-center gap-4 px-4 sm:px-0"
            >
              {VIDEOS.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveId(video.id)}
                  className="group relative h-[320px] w-[180px] shrink-0 overflow-hidden rounded-3xl bg-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.35)] sm:h-[380px] sm:w-[220px]"
                  data-card
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="220px"
                    unoptimized
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" />
                  <span className="pointer-events-none absolute inset-x-3 bottom-4 line-clamp-2 text-left text-xs font-semibold text-white sm:text-sm">
                    {video.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1 shadow md:inline-flex"
            aria-label="Xem video trước"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-1 shadow md:inline-flex"
            aria-label="Xem video sau"
          >
            <ChevronRight className="h-4 w-4 text-slate-700" />
          </button>
          {activeVideo && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
              <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-xl">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  aria-label="Đóng video"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative aspect-video w-full">
                  <iframe
                    src={getEmbedUrl(activeVideo.url)}
                    title={activeVideo.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

