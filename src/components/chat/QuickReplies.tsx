"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuickReply = {
  text: string;
  action?: () => void;
};

type QuickRepliesProps = {
  replies: QuickReply[];
  onSelect: (text: string) => void;
  className?: string;
};

const DEFAULT_QUICK_REPLIES = [
  { text: "Chọn hương vị" },
  { text: "Tư vấn quà tặng" },
  { text: "Xem sản phẩm trong tầm 300k" },
  { text: "Tính phí ship Hà Nội" },
];

export function QuickReplies({
  replies = DEFAULT_QUICK_REPLIES,
  onSelect,
  className,
}: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div
      className={cn(
        // Mobile: horizontal scroll slider with snap
        "flex overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-3 px-3 gap-2",
        // Desktop: wrap normally
        "sm:flex-wrap sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0",
        className,
      )}
      style={{
        // Hide scrollbar but keep scroll functionality
        scrollbarWidth: "none" /* Firefox */,
        msOverflowStyle: "none" /* IE/Edge */,
      }}
    >
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className={cn(
            // Mobile: horizontal slider chip, no wrap
            "shrink-0 snap-start whitespace-nowrap rounded-full border px-3 py-1 text-xs sm:text-sm",
            // Desktop: normal button
            "sm:shrink sm:snap-none",
          )}
          onClick={() => {
            onSelect(reply.text);
            reply.action?.();
          }}
        >
          {reply.text}
        </Button>
      ))}
    </div>
  );
}

