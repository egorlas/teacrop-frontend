"use client";

import { useCallback, useState } from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FEELING_AXIS_X_KEYS,
  FEELING_AXIS_Y_KEYS,
  type FeelingAxisX,
  type FeelingAxisY,
  type TeaFeelingAxisLabels,
  type TeaFeelingSelection,
} from "@/types/tea-feeling";

type TeaFeelingMatrixProps = {
  labels: TeaFeelingAxisLabels;
  selection: TeaFeelingSelection;
  onSelect: (y: FeelingAxisY, x: FeelingAxisX) => void;
};

type CellKey = `${FeelingAxisY}:${FeelingAxisX}`;

/** Màu chữ nhãn trục tung (Vui → Gia đình). */
const FEELING_ROW_TEXT_COLORS: Record<FeelingAxisY, string> = {
  vui: "#d91b5c",
  buon: "#f1592a",
  mot_minh: "#fff200",
  ban_be: "#13a89e",
  nhom_hop: "#662d91",
  gia_dinh: "#662d91",
};

export function TeaFeelingMatrix({ labels, selection, onSelect }: TeaFeelingMatrixProps) {
  const selectedY = selection?.y;
  const selectedX = selection?.x;

  /** Tăng mỗi lần click ô để remount face và chạy lại animation lật. */
  const [flipTickByCell, setFlipTickByCell] = useState<Partial<Record<CellKey, number>>>({});

  const handleCellActivate = useCallback(
    (y: FeelingAxisY, x: FeelingAxisX) => {
      const key = `${y}:${x}` as CellKey;
      onSelect(y, x);
      setFlipTickByCell((prev) => ({
        ...prev,
        [key]: (prev[key] ?? 0) + 1,
      }));
    },
    [onSelect],
  );

  return (
    <section
      aria-labelledby="tea-feeling-matrix-heading"
      className="rounded-2xl border border-emerald-900/10 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6 lg:p-7"
    >
      <div className="mb-5 flex flex-col gap-1 sm:mb-6">
        <h2
          id="tea-feeling-matrix-heading"
          className="text-xl font-semibold tracking-tight text-emerald-950 sm:text-2xl"
        >
          Lưới cảm xúc &amp; thời tiết
        </h2>
        <p className="text-sm text-stone-600 sm:text-base">
          Chạm một ô — hàng là tâm trạng / không gian, cột là thời tiết.
        </p>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2 sm:mx-0">
        <div className="inline-block min-w-full px-1 sm:min-w-0">
          <div
            className="grid w-max min-w-[min(100%,960px)] gap-2 sm:w-full sm:min-w-0 sm:gap-2.5"
            style={{
              gridTemplateColumns: `minmax(7.5rem, 9.5rem) repeat(6, minmax(3.5rem, 1fr))`,
            }}
            role="grid"
            aria-label="Ma trận chọn trà theo cảm xúc và thời tiết"
          >
            <div role="rowheader" className="p-0" />
            {FEELING_AXIS_X_KEYS.map((x) => (
              <div
                key={x}
                role="columnheader"
                className="flex min-h-[3.25rem] items-end justify-center px-1 pb-1.5 text-center text-xs font-semibold uppercase leading-tight tracking-wide text-emerald-900/70 sm:min-h-[3.5rem] sm:text-sm"
              >
                <span className="max-w-[5.5rem] text-balance">{labels.x[x]}</span>
              </div>
            ))}

            {FEELING_AXIS_Y_KEYS.map((y, rowIndex) => (
              <div key={y} className="contents" role="row">
                <div
                  role="rowheader"
                  className="sticky left-0 z-[1] flex min-h-[3.75rem] items-center border-r border-emerald-900/10 bg-gradient-to-r from-emerald-50 to-white px-2.5 py-2 font-semibold uppercase leading-snug tracking-wide shadow-[4px_0_12px_-8px_rgba(6,78,59,0.35)] sm:min-h-[4rem] sm:px-3"
                >
                  <span
                    className={cn(
                      "line-clamp-3 text-balance text-sm sm:text-base lg:text-lg",
                      y === "mot_minh" && "drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]",
                    )}
                    style={{ color: FEELING_ROW_TEXT_COLORS[y] }}
                  >
                    {labels.y[y]}
                  </span>
                </div>
                {FEELING_AXIS_X_KEYS.map((x, colIndex) => {
                  const cellOrder = rowIndex * FEELING_AXIS_X_KEYS.length + colIndex + 1;
                  const isSelected = selectedY === y && selectedX === x;
                  const cellKey = `${y}:${x}` as CellKey;
                  const flipTick = flipTickByCell[cellKey] ?? 0;

                  return (
                    <div
                      key={`${y}-${x}`}
                      className="perspective-[900px] min-h-[3.75rem] min-w-[3.5rem] sm:min-h-[4rem] sm:min-w-0"
                    >
                      <button
                        key={flipTick}
                        type="button"
                        role="gridcell"
                        title={`Ô ${cellOrder} — ${labels.y[y]} · ${labels.x[x]}`}
                        aria-selected={isSelected}
                        aria-label={`Ô ${cellOrder}: ${labels.y[y]}, ${labels.x[x]}`}
                        className={cn(
                          "group relative flex h-full w-full min-h-[3.75rem] items-center justify-center rounded-xl border sm:min-h-[4rem]",
                          "transition-[border-color,box-shadow,filter] duration-200",
                          flipTick > 0 && "animate-tea-feeling-matrix-flip",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700",
                          isSelected
                            ? "border-emerald-700 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-[0_10px_32px_-10px_rgba(6,78,59,0.65)] ring-2 ring-amber-300/90"
                            : "border-emerald-900/15 bg-gradient-to-br from-stone-50/90 to-emerald-50/40 text-emerald-950/85 hover:z-[1] hover:border-emerald-600/40 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-amber-50/50 hover:shadow-md",
                        )}
                        onClick={() => handleCellActivate(y, x)}
                      >
                        <span className="sr-only">
                          Ô {cellOrder}, {labels.y[y]} — {labels.x[x]}
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                            !isSelected &&
                              "bg-gradient-to-br from-amber-200/25 via-transparent to-emerald-200/20",
                          )}
                        />
                        <Leaf
                          className={cn(
                            "relative size-6 shrink-0 sm:size-7",
                            isSelected ? "text-amber-100" : "text-emerald-700/90",
                          )}
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-stone-500 sm:hidden">
        Vuốt ngang để xem đủ lưới trên màn hình nhỏ.
      </p>
    </section>
  );
}
