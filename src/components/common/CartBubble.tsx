"use client";

import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { CartModal } from "@/components/cart/CartModal";

export function CartBubble() {
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
      <button
        onClick={() => setCartModalOpen(true)}
        className={cn(
          "fixed z-50",
          "flex items-center justify-center",
          "rounded-full bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/50",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-xl hover:shadow-primary/60",
          "active:scale-95",
          "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "h-12 w-12 sm:h-14 sm:w-14",
          // Animation
          "animate-in fade-in slide-in-from-bottom-4 duration-500",
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
              "rounded-full bg-destructive text-destructive-foreground",
              "text-xs font-bold",
              "border-2 border-background",
              "animate-in zoom-in-50 duration-200",
            )}
          >
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
        
        {/* Pulse animation ring - only show on desktop */}
        {itemCount > 0 && (
          <span
            className={cn(
              "hidden sm:block absolute inset-0 rounded-full",
              "bg-primary opacity-75",
              "animate-ping"
            )}
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
