"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Container } from "@/components/Container";

type VideoKind = "youtube" | "tiktok";

type BaseVideo = {
  id: string;
  title: string;
  thumbnail: string;
  kind: VideoKind;
};

type YoutubeVideo = BaseVideo & {
  kind: "youtube";
  url: string;
};

type TiktokVideo = BaseVideo & {
  kind: "tiktok";
  tiktokVideoId: string;
};

const VIDEOS: Array<YoutubeVideo | TiktokVideo> = [
  {
    id: "v1",
    title: "Trà Nương là tư vấn viên thay menu đó 😍",
    thumbnail:
      "https://placehold.co/320x560/f97316/ffffff?text=TikTok+Video",
    kind: "tiktok",
    tiktokVideoId: "7187295066648481051",
  },
  {
    id: "v2",
    title: "TikTok video 2",
    thumbnail:
      "https://placehold.co/320x560/22c55e/ffffff?text=TikTok+Video+2",
    kind: "tiktok",
    tiktokVideoId: "7232903281390161158",
  },
  {
    id: "v3",
    title: "TikTok video 3",
    thumbnail:
      "https://placehold.co/320x560/facc15/000000?text=TikTok+Video+3",
    kind: "tiktok",
    tiktokVideoId: "7229902915270380801",
  },
  {
    id: "v4",
    title: "TikTok video 4",
    thumbnail:
      "https://placehold.co/320x560/38bdf8/ffffff?text=TikTok+Video+4",
    kind: "tiktok",
    tiktokVideoId: "7227625320436862213",
  },
  {
    id: "v5",
    title: "TikTok video 5",
    thumbnail:
      "https://placehold.co/320x560/ec4899/ffffff?text=TikTok+Video+5",
    kind: "tiktok",
    tiktokVideoId: "7224443601890102533",
  },
];

const VIDEO_SRC =
  "https://res.cloudinary.com/dzepc9mrh/video/upload/v1773999577/video_demo_peqkng.mp4";

export function SocialVideoSlider() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const inlineVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [videoPoster, setVideoPoster] = useState<string | null>(null);

  const activeVideo =
    activeId !== null ? VIDEOS.find((v) => v.id === activeId) ?? null : null;

  useEffect(() => {
    // Tắt preview inline khi mở popup để giảm tốn tài nguyên.
    Object.values(inlineVideoRefs.current).forEach((v) => {
      if (!v) return;
      v.pause();
      v.currentTime = 0;
    });
  }, [activeId]);

  useEffect(() => {
    // Tạo poster thumbnail từ frame đầu của video để hiển thị trước khi play.
    // (video tag không hỗ trợ tự lấy thumbnail từ mp4 nếu không có poster.)
    let cancelled = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = VIDEO_SRC;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const MAX_W = 720;

    const capture = () => {
      if (cancelled) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      const scale = Math.min(MAX_W / vw, 1);
      const w = Math.round(vw * scale);
      const h = Math.round(vh * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      try {
        const url = canvas.toDataURL("image/jpeg", 0.82);
        setVideoPoster(url);
      } catch {
        // ignore (toDataURL có thể fail nếu trình duyệt giới hạn)
      }
    };

    const onLoadedMetadata = () => {
      try {
        video.currentTime = 0;
      } catch {
        // ignore
      }
    };

    const onSeeked = () => {
      capture();
      video.pause();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);
    void video.load();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const v = modalVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {
      // Autoplay có thể bị chặn; user vẫn có thể bấm play trong popup.
    });
  }, [activeId]);

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
    <section className="bg-white py-10">
      <Container>
        <div className="mb-6 text-center py-18">
          <p className="text-2xl  font-semibold py-3 text-slate-600">
            Bạn đã theo dõi Tea Love trên mạng xã hội chưa ?
          </p>
          <p className="mt-2 text-xl text-slate-600">
            Hãy theo dõi chúng tôi trên các nền tảng MXH nhé !
          </p>
        </div>
        <div className="relative">
          {/* scroll container */}
          <div ref={trackRef} className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
            {/* track */}
            <div className="inline-flex min-w-full justify-center gap-4 px-4 sm:px-0">
              {VIDEOS.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setActiveId(video.id)}
                  onMouseEnter={() => {
                    const el = inlineVideoRefs.current[video.id];
                    if (!el) return;
                    el.currentTime = 0;
                    void el.play().catch(() => {});
                  }}
                  onMouseLeave={() => {
                    const el = inlineVideoRefs.current[video.id];
                    if (!el) return;
                    el.pause();
                    el.currentTime = 0;
                  }}
                  className="group relative h-[320px] w-[180px] shrink-0 overflow-hidden rounded-3xl bg-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.22)] sm:h-[380px] sm:w-[220px]"
                  data-card
                >
                  <video
                    ref={(el) => {
                      inlineVideoRefs.current[video.id] = el;
                    }}
                    src={VIDEO_SRC}
                    crossOrigin="anonymous"
                    poster={videoPoster ?? undefined}
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
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
        </div>
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

              <div className="p-4">
                <video
                  key={activeVideo.id}
                  ref={modalVideoRef}
                  src={VIDEO_SRC}
                  crossOrigin="anonymous"
                  poster={videoPoster ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[70vh] object-contain bg-black"
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

