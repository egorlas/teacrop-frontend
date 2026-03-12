"use client";

import { useEffect, useState } from "react";

const HEART_COUNT = 12;
const DURATION_MS = 4500;

// Stagger positions (left %) and delays so hearts feel natural
const positions = [
  { left: "8%", delay: 0 },
  { left: "18%", delay: 0.25 },
  { left: "28%", delay: 0.5 },
  { left: "42%", delay: 0.15 },
  { left: "55%", delay: 0.4 },
  { left: "68%", delay: 0.1 },
  { left: "78%", delay: 0.35 },
  { left: "88%", delay: 0.2 },
  { left: "22%", delay: 0.45 },
  { left: "62%", delay: 0.3 },
  { left: "35%", delay: 0.05 },
  { left: "72%", delay: 0.55 },
];

export function FloatingHearts() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setHidden(true);
    }, DURATION_MS + 500);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-100 overflow-hidden"
      aria-hidden
    >
      {positions.slice(0, HEART_COUNT).map((pos, i) => (
        <div
          key={i}
          className="absolute animate-heart-float text-pink-300/70"
          style={{
            left: pos.left,
            bottom: "-1rem",
            width: "1.25rem",
            height: "1.25rem",
            animationDelay: `${pos.delay}s`,
            animationDuration: `${DURATION_MS}ms`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-full w-full"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
