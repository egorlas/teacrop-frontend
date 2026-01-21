"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { CartModal } from "@/components/cart/CartModal";

export function FloatingButtons() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const { items } = useCartStore();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hide on agent-chat page or staff pages
  if (pathname === "/agent-chat" || pathname?.startsWith("/staff")) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <CartModal open={cartModalOpen} onOpenChange={setCartModalOpen} />
      <div
        className={cn(
          "fixed z-50 flex flex-col",
          // Position: bottom right corner
          "bottom-4 right-4 sm:bottom-6 sm:right-6",
          // Safe area for mobile devices
          "pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:pb-0",
          // Animation
          "animate-in fade-in slide-in-from-bottom-4 duration-500",
        )}
      >
        {/* Cart Button - Orange/Amber color */}
        <button
          onClick={() => setCartModalOpen(true)}
          className={cn(
            "flex h-12 w-12 items-center justify-center",
            "rounded-full bg-amber-500 text-white",
            "shadow-lg shadow-amber-500/50",
            "transition-all duration-200 ease-out",
            "hover:scale-110 hover:shadow-xl hover:shadow-amber-500/60 hover:bg-amber-600",
            "active:scale-95",
            "cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
            // Desktop: larger size
            "sm:h-14 sm:w-14",
            // Relative positioning for badge
            "relative",
          )}
          aria-label="Giỏ hàng"
          title="Giỏ hàng"
        >
          <ShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />

          {/* Badge showing item count */}
          {itemCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 z-20",
                "flex h-5 w-5 items-center justify-center",
                "rounded-full bg-red-500 text-white",
                "text-xs font-bold",
                "border-2 border-background",
              )}
            >
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
