"use client";

import {
  Hash,
  Package,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Plus,
  Upload,
  Save,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type VariantRow = {
  id?: number | string;
  name_variant: string;
  SKU?: string;
  default_price?: number | null;
  sale_price?: number | null;
  inventory?: number;
  weight?: number | null;
  package?: "bag" | "box" | "";
  thumbnail?: string;
};

type VariantCardsProps = {
  variants: VariantRow[];
  productImageUrl?: string;
  onChange: (index: number, key: keyof VariantRow, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave?: () => void;
  isSaving?: boolean;
  onSaveVariant?: (index: number) => void;
};

function formatPrice(price?: number | null): string {
  if (price === undefined || price === null) return "0k";
  const asNumber = Number(price);
  if (Number.isNaN(asNumber)) return "0k";
  return `${(asNumber / 1000).toFixed(0)}k`;
}

export function VariantCards({
  variants,
  productImageUrl,
  onChange,
  onAdd,
  onRemove,
  onSave,
  isSaving,
  onSaveVariant,
}: VariantCardsProps) {
  const totalInventory = variants.reduce(
    (acc, v) => acc + (v.inventory ?? 0),
    0,
  );

  return (
    <div className="border rounded-lg bg-card p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-semibold">Biến thể sản phẩm</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng tồn kho:{" "}
            <span className="font-semibold">
              {totalInventory.toLocaleString("vi-VN")}
            </span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Thêm biến thể mới
        </Button>
      </div>

      {variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Package className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            Chưa có biến thể nào, bấm &quot;Thêm biến thể mới&quot; để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {variants.map((v, index) => {
            const inv = v.inventory ?? 0;
            const price = v.sale_price ?? v.default_price ?? 0;

            let statusLabel = "Đủ hàng";
            let StatusIcon: any = CheckCircle;
            let statusClass = "text-emerald-600";

            if (inv === 0) {
              statusLabel = "Hết hàng";
              StatusIcon = AlertCircle;
              statusClass = "text-red-600";
            } else if (inv > 0 && inv < 10) {
              statusLabel = "Sắp hết";
              StatusIcon = AlertTriangle;
              statusClass = "text-orange-600";
            }

            const handleChangeThumbnail = () => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e: any) => {
                const file = e.target.files?.[0] as File | undefined;
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  onChange(index, "thumbnail", result);
                };
                reader.readAsDataURL(file);
              };

              input.click();
            };

            const imageSrc =
              v.thumbnail || productImageUrl || "/placeholder.png";

            return (
              <article
                key={v.id ?? `row-${index}`}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
              >
                {/* Hình ảnh dạng vòng tròn giống FeaturedProducts */}
                <button
                  type="button"
                  onClick={handleChangeThumbnail}
                  className="group relative mx-auto mt-4 h-32 w-32 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <div className="absolute inset-0 rounded-full bg-emerald-50" />
                  <div className="relative z-10 h-full w-full overflow-hidden rounded-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc}
                      alt={v.name_variant || "Variant image"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="flex items-center gap-1 text-xs font-medium text-white">
                        <Upload className="h-3 w-3" />
                        Đổi ảnh
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex flex-1 flex-col px-4 pb-4 pt-3 space-y-3">
                  {/* Header: SKU + trạng thái + nút xóa */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      <span className="font-mono">
                        {v.SKU || "Chưa có SKU"}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 ${statusClass}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Tên biến thể */}
                  <div className="space-y-1">
                    <Label className="text-[11px]">Tên biến thể</Label>
                    <Input
                      value={v.name_variant}
                      onChange={(e) =>
                        onChange(index, "name_variant", e.target.value)
                      }
                      className="h-8 text-xs"
                      placeholder="VD: 100g Túi, 200g Hộp..."
                    />
                  </div>

                  {/* Thông tin phụ: trọng lượng + package */}
                  <p className="text-[11px] text-slate-500">
                    {v.weight ? `${v.weight}g` : ""}
                    {v.weight && v.package ? " • " : ""}
                    {v.package === "bag"
                      ? "Túi"
                      : v.package === "box"
                      ? "Hộp"
                      : ""}
                  </p>

                  {/* Giá + tồn kho (giống FeaturedProducts) */}
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-700">
                    <span>{formatPrice(price)}</span>
                    <span className="text-[11px] text-emerald-600">
                      Tồn kho: {inv.toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Nhóm field chỉnh sửa nhanh */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Giá gốc (VND)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={v.default_price ?? ""}
                        onChange={(e) =>
                          onChange(index, "default_price", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Giá sale (VND)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={v.sale_price ?? ""}
                        onChange={(e) =>
                          onChange(index, "sale_price", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px]">Tồn kho</Label>
                      <Input
                        type="number"
                        min={0}
                        value={inv}
                        onChange={(e) =>
                          onChange(index, "inventory", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Trọng lượng (g)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={v.weight ?? ""}
                        onChange={(e) =>
                          onChange(index, "weight", e.target.value)
                        }
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end gap-2">
                    {onSaveVariant && (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-7 px-3 text-[11px]"
                        onClick={() => onSaveVariant(index)}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Lưu
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="h-7 px-3 text-[11px]"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
