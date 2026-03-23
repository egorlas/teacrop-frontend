"use client";

import { useCallback, useMemo, useState } from "react";
import { TeaFeelingMatrix } from "@/components/tea-feeling/TeaFeelingMatrix";
import { TeaFeelingResultCard } from "@/components/tea-feeling/TeaFeelingResultCard";
import { TeaFeelingCta } from "@/components/tea-feeling/TeaFeelingCta";
import { cn } from "@/lib/utils";
import type {
  FeelingAxisX,
  FeelingAxisY,
  TeaFeelingMatrixKey,
  TeaFeelingMatrixPayload,
  TeaFeelingProductItem,
  TeaFeelingSelection,
} from "@/types/tea-feeling";

type TeaFeelingExperienceProps = {
  payload: TeaFeelingMatrixPayload;
};

export function TeaFeelingExperience({ payload }: TeaFeelingExperienceProps) {
  const [selection, setSelection] = useState<TeaFeelingSelection>(null);

  const productsByKey = useMemo(() => {
    const map = new Map<TeaFeelingMatrixKey, TeaFeelingProductItem[]>();
    for (const cell of payload.cells) {
      map.set(`${cell.y}:${cell.x}` as TeaFeelingMatrixKey, cell.products);
    }
    return map;
  }, [payload.cells]);

  const selectedProducts: TeaFeelingProductItem[] | null = useMemo(() => {
    if (!selection) {
      return null;
    }
    return productsByKey.get(`${selection.y}:${selection.x}` as TeaFeelingMatrixKey) ?? null;
  }, [selection, productsByKey]);

  const moodLabel = selection ? payload.labels.y[selection.y] : null;
  const weatherLabel = selection ? payload.labels.x[selection.x] : null;

  const onSelect = useCallback((y: FeelingAxisY, x: FeelingAxisX) => {
    setSelection({ y, x });
  }, []);

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-10 lg:space-y-12">
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 gap-6 sm:gap-8",
          "lg:grid-cols-[minmax(0,1fr)_minmax(0,min(380px,100%))] lg:items-start lg:gap-10",
          "xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:gap-12",
        )}
      >
        <div className="min-w-0">
          <TeaFeelingMatrix labels={payload.labels} selection={selection} onSelect={onSelect} />
        </div>

        <div
          id="tea-feeling-result"
          className={cn(
            "min-w-0",
            "lg:sticky lg:top-20 lg:max-h-[min(100dvh,56rem)] lg:overflow-y-auto lg:overscroll-contain lg:[-webkit-overflow-scrolling:touch]",
          )}
          aria-live="polite"
        >
          <TeaFeelingResultCard
            products={selectedProducts}
            moodLabel={moodLabel}
            weatherLabel={weatherLabel}
          />
        </div>
      </div>

      <TeaFeelingCta />
    </div>
  );
}
