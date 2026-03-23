"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TeaFeelingProductItem } from "@/types/tea-feeling";

type TeaFeelingProductDetailDialogProps = {
  product: TeaFeelingProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/55">{label}</p>
      <p className="text-pretty text-sm leading-relaxed text-stone-800 sm:text-[15px]">{children}</p>
    </div>
  );
}

export function TeaFeelingProductDetailDialog({
  product,
  open,
  onOpenChange,
}: TeaFeelingProductDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeButtonClassName="z-10 size-12 rounded-full border border-stone-200/80 bg-white/95 text-stone-800 opacity-100 shadow-md backdrop-blur-sm max-lg:right-3 max-lg:top-3 sm:right-5 sm:top-5"
        closeIconClassName="h-6 w-6"
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          "max-h-[90dvh] w-full max-w-lg sm:max-w-md",
          /* Mobile: full screen như app */
          "max-lg:fixed max-lg:inset-0 max-lg:left-0 max-lg:top-0 max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:max-w-none max-lg:translate-x-0 max-lg:translate-y-0 max-lg:rounded-none",
          /* Giữ animation mặc định dialog trên desktop; mobile ít zoom hơn nhờ inset-0 */
        )}
      >
        {product ? (
          <>
            <div className="relative aspect-[4/3] w-full shrink-0 bg-emerald-950/10 max-lg:aspect-[16/10]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1023px) 100vw, 448px"
                  priority={false}
                />
              ) : (
                <div className="flex h-full min-h-[10rem] items-center justify-center text-emerald-800/25">
                  <Sparkles className="size-16" aria-hidden />
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-4 sm:px-6 sm:pt-5">
                <DialogHeader className="space-y-3 text-left">
                  <DialogTitle className="text-xl leading-snug sm:text-2xl">{product.name}</DialogTitle>
                  <DialogDescription className="text-left text-base leading-relaxed text-stone-600">
                    {product.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-5 border-t border-emerald-900/10 pt-5">
                  <DetailBlock label="Mùi">{product.smell}</DetailBlock>
                  <DetailBlock label="Vị">{product.taste}</DetailBlock>
                  <DetailBlock label="Nguồn gốc">{product.origin}</DetailBlock>
                  <DetailBlock label="Câu chuyện">{product.story}</DetailBlock>
                </div>
              </div>

              <div
                className={cn(
                  "shrink-0 border-t border-emerald-900/10 bg-stone-50/90 px-4 py-4 sm:px-6",
                  "pb-[max(1rem,env(safe-area-inset-bottom))] pt-4",
                )}
              >
                <Link
                  href={product.orderHref}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full gap-2 bg-emerald-900 text-amber-50 hover:bg-emerald-950",
                  )}
                  onClick={() => onOpenChange(false)}
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  Gọi trà
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
