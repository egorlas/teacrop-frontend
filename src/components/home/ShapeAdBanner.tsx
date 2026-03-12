"use client";

import { useId } from "react";
import Image from "next/image";

export type AdBannerShape = "leaf" | "teapot";

type ShapeAdBannerProps = {
  side: "left" | "right";
  shape: AdBannerShape;
  /** Đường dẫn ảnh quảng cáo. Để trống sẽ hiển thị nền placeholder, sau này có thể thêm ảnh. */
  imageSrc?: string;
  alt?: string;
  href?: string;
};

// Lá trà (tọa độ chuẩn hóa 0–1 cho objectBoundingBox)
const leafPath =
  "M 0.5 0.04 C 0.9 0.28 0.9 0.72 0.5 0.96 C 0.1 0.72 0.1 0.28 0.5 0.04 Z";

// Ấm trà (tọa độ 0–1)
const teapotPath =
  "M 0.18 0.88 L 0.18 0.28 Q 0.18 0.08 0.5 0.08 Q 0.82 0.08 0.82 0.28 L 0.82 0.88 Q 0.82 0.95 0.5 0.95 Q 0.18 0.95 0.18 0.88 Z M 0.82 0.25 L 0.98 0.2 L 0.98 0.28 L 0.82 0.3 Z";

export function ShapeAdBanner({
  side,
  shape,
  imageSrc,
  alt = "Banner quảng cáo",
  href,
}: ShapeAdBannerProps) {
  const id = useId().replace(/:/g, "");
  const clipId = `ad-clip-${shape}-${side}-${id}`;

  const pathD = shape === "leaf" ? leafPath : teapotPath;
  const isLeafLeft = shape === "leaf" && side === "left";

  const sizeStyle = {
    width: "clamp(100px, 12vw, 180px)",
    height: "clamp(140px, 18vw, 220px)",
  };

  const content = imageSrc ? (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 0px, 180px"
      unoptimized={imageSrc.startsWith("http")}
    />
  ) : (
    <div
      className="absolute inset-0 bg-linear-to-br from-pink-100 to-rose-100"
      aria-hidden
    />
  );

  return (
    <div
      className="hidden shrink-0 lg:block relative overflow-hidden rounded-sm"
      style={{
        ...sizeStyle,
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.06))",
      }}
      aria-hidden
    >
      <svg width="0" height="0" aria-hidden>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path
              d={pathD}
              transform={isLeafLeft ? "scale(-1, 1) translate(-1, 0)" : undefined}
            fillRule="evenodd"
            />
          </clipPath>
        </defs>
      </svg>
      <div
        className="absolute inset-0 rounded-sm border border-pink-200/40"
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
      >
        {content}
      </div>
      {href && (
        <a
          href={href}
          className="absolute inset-0 z-10 block"
          aria-label={alt}
        />
      )}
    </div>
  );
}
