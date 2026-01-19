"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-3 px-0">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border border-border overflow-hidden sm:h-10 sm:w-10">
        <Image
          src="/logo-viettea.svg"
          alt="Viettea AI"
          width={32}
          height={32}
          className="object-contain p-1 sm:p-1.5 sm:w-10 sm:h-10"
          priority={false}
        />
      </div>

      {/* Typing dots - Mobile: smaller, Desktop: normal */}
      <div className="flex max-w-[85%] items-center gap-1 rounded-2xl bg-muted px-3 py-2 sm:max-w-[70%] sm:px-4 sm:py-3">
        <span className="flex gap-1">
          <span
            className={cn(
              "h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce",
              "animation-delay-0",
            )}
            style={{ animationDelay: "0ms" }}
          />
          <span
            className={cn(
              "h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce",
              "animation-delay-150",
            )}
            style={{ animationDelay: "150ms" }}
          />
          <span
            className={cn(
              "h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce",
              "animation-delay-300",
            )}
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}

