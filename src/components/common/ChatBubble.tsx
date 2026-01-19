"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ChatBubble() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hide on agent-chat page or staff pages
  if (pathname === "/agent-chat" || pathname?.startsWith("/staff")) {
    return null;
  }

  const handleClick = () => {
    router.push("/agent-chat");
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/50",
        "transition-all duration-300",
        "hover:scale-110 hover:shadow-xl hover:shadow-primary/60",
        "active:scale-95",
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Mobile: smaller size and position
        "bottom-4 right-4 h-12 w-12 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14",
        // Safe area for mobile devices
        "pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:pb-0",
        // Animation
        "animate-in fade-in slide-in-from-bottom-4 duration-500",
      )}
      aria-label="Chat với AI"
      title="Chat với AI"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
      
      {/* Pulse animation ring - only show on desktop */}
      <span
        className={cn(
          "hidden sm:block absolute inset-0 rounded-full",
          "bg-primary opacity-75",
          "animate-ping"
        )}
        aria-hidden="true"
      />
    </button>
  );
}
