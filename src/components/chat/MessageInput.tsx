"use client";

import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
}: MessageInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (without Shift) sends message
    // Shift+Enter allows new line
    // Ctrl+Enter (or Cmd+Enter) also sends message
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      }
      // Send on Enter or Ctrl+Enter/Cmd+Enter
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleSend();
        return;
      }
      // Regular Enter sends
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 flex gap-2 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 px-3 py-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] sm:static sm:px-4 sm:py-4 sm:pb-4">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="min-h-[44px] max-h-[40vh] w-full resize-none rounded-xl px-3 py-2 text-sm sm:max-h-[120px] sm:text-base"
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          const maxHeight = window.innerWidth < 640 ? window.innerHeight * 0.4 : 120;
          target.style.height = `${Math.min(target.scrollHeight, maxHeight)}px`;
        }}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        size="default"
        className="shrink-0"
        aria-label="Gửi tin nhắn"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

