"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Package, Hash } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { strapiClient } from "@/lib/strapi/strapiClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function NewProductInventoryClient() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    sku: "",
    productType: "tea",
  });

  const handleCreate = async () => {
    try {
      setError(null);

      if (!hasHydrated) return;

      if (!token) {
        setError("Thiếu token xác thực. Vui lòng đăng nhập lại.");
        return;
      }

      if (!form.title.trim()) {
        setError("Vui lòng nhập tên sản phẩm.");
        return;
      }

      setIsCreating(true);

      const payload: any = {
        title: form.title.trim(),
        sku: form.sku.trim() || undefined,
        productType: form.productType,
      };

      const res = await strapiClient<any>("/api/products", {
        method: "POST",
        requiresAuth: true,
        token,
        body: JSON.stringify({ data: payload }),
      });

      const created = res?.data || res;
      const newId = created?.id;

      if (!newId) {
        throw new Error("Không lấy được ID sản phẩm mới tạo.");
      }

      router.replace(`/staff/inventory/${newId}`);
    } catch (err: any) {
      setError(
        err?.message ||
          "Không thể tạo sản phẩm mới. Vui lòng quay lại danh sách và thử lại.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tạo sản phẩm mới</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thông tin sẽ được lưu lên server khi bạn bấm{" "}
            <strong>Tạo sản phẩm</strong>.
          </p>
        </div>
        <button
          type="button"
          className="text-xs underline text-muted-foreground"
          onClick={() => router.push("/staff/inventory")}
        >
          ← Quay lại danh sách
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg bg-card space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Thông tin sản phẩm
          </h2>

          <div className="space-y-2">
            <Label htmlFor="title">Tên sản phẩm</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Nhập tên sản phẩm..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
                placeholder="Nhập SKU (tuỳ chọn)..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productType">Loại sản phẩm</Label>
            <Select
              value={form.productType}
              onValueChange={(value) =>
                setForm((f) => ({ ...f, productType: value }))
              }
            >
              <SelectTrigger id="productType">
                <SelectValue placeholder="Chọn loại sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tea">Trà</SelectItem>
                <SelectItem value="tea_tools">Trà cụ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white text-sm"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tạo sản phẩm...
            </>
          ) : (
            <>Tạo sản phẩm</>
          )}
        </button>
      </div>
    </div>
  );
}


