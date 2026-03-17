"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hash, Package, Plus, Save, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth";
import { strapiClient } from "@/lib/strapi/strapiClient";
import { VariantCards, VariantRow } from "@/components/staff/VariantCards";
import { LexicalDescriptionEditor } from "@/components/staff/LexicalDescriptionEditor";

interface Props {
  productId?: number;
}

function formatPrice(price?: number | null) {
  if (price === undefined || price === null) return "N/A";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function ProductInventoryClient({ productId }: Props) {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();

  const [isLoading, setIsLoading] = useState<boolean>(!!productId);
  const [error, setError] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    title: "",
    sku: "",
    productType: "",
    teaType: "",
    ingredient: "",
    finished_goods: "",
    description: "",
  imageUrl: "",
    attributes: {
      origin: "",
      brand: "",
      expiry: "",
    },
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [isSavingVariants, setIsSavingVariants] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!productId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);

        // Chờ state auth rehydrate xong để tránh vòng lặp reload
        if (!hasHydrated) {
          return;
        }

        if (!token) {
          setError("Thiếu token xác thực. Vui lòng đăng nhập lại.");
          return;
        }

        const raw = await strapiClient<any>(`/api/get-product-by-id/${productId}`, {
          method: "GET",
          requiresAuth: true,
          token,
        });

        const rawData = raw?.data || raw;
        if (!rawData) {
          throw new Error("Không tìm thấy sản phẩm.");
        }

        const attr = rawData.attributes || rawData;

        const productTitle = (attr.title as string | undefined) ?? "";
        const productSku = (attr.sku as string | undefined) ?? "";
        const productType = (attr.productType as string | undefined) ?? "";
        const teaType = (attr.teaType as string | undefined) ?? "";
        const ingredient = (attr.ingredient as string | undefined) ?? "";
        const finishedGoods = (attr.finished_goods as string | undefined) ?? "";

        // image (media)
        let imageUrl = "";
        const images = attr.images;
        const baseUrl =
          process.env.NEXT_PUBLIC_STRAPI_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://192.168.31.187:1337";
        if (images) {
          // v5 flat: images is file object or has url
          if (typeof images === "object" && images.url) {
            imageUrl = images.url.startsWith("http")
              ? images.url
              : `${baseUrl}${images.url}`;
          } else if (Array.isArray(images) && images.length > 0) {
            const img = images[0] as any;
            if (img.url) {
              imageUrl = img.url.startsWith("http")
                ? img.url
                : `${baseUrl}${img.url}`;
            }
          } else if (images.data && Array.isArray(images.data) && images.data[0]?.attributes?.url) {
            const u = images.data[0].attributes.url as string;
            imageUrl = u.startsWith("http") ? u : `${baseUrl}${u}`;
          }
        }

        // description (blocks) -> simple plain text
        let descriptionText = "";
        const description = attr.description;
        if (description) {
          try {
            if (Array.isArray(description)) {
              descriptionText = description
                .map((block: any) => {
                  if (block?.children && Array.isArray(block.children)) {
                    return block.children
                      .map((c: any) => c.text || "")
                      .join("");
                  }
                  return block.text || "";
                })
                .join("\n");
            } else if (typeof description === "string") {
              descriptionText = description;
            }
          } catch {
            // ignore parse errors
          }
        }

        // attributes JSON
        let attributes = {
          origin: "",
          brand: "",
          expiry: "",
        };
        if (attr.attributes) {
          try {
            const rawAttrs =
              typeof attr.attributes === "string"
                ? JSON.parse(attr.attributes)
                : attr.attributes;
            attributes = {
              origin: rawAttrs?.origin || "",
              brand: rawAttrs?.brand || "",
              expiry: rawAttrs?.expiry || "",
            };
          } catch {
            // ignore JSON parse errors
          }
        }

        const variantsRaw =
          rawData?.product_variants ||
          rawData?.attributes?.product_variants ||
          [];

        const flat: VariantRow[] = Array.isArray(variantsRaw)
          ? variantsRaw.map((v: any) => {
              const src = v.attributes || v;

              let thumbnailUrl: string | undefined;
              const thumb = src?.thumbnail;
              if (thumb) {
                if (typeof thumb === "object" && thumb.url) {
                  thumbnailUrl = thumb.url.startsWith("http")
                    ? thumb.url
                    : `${baseUrl}${thumb.url}`;
                } else if (
                  Array.isArray(thumb) &&
                  thumb.length > 0 &&
                  (thumb[0] as any)?.url
                ) {
                  const t = (thumb[0] as any).url as string;
                  thumbnailUrl = t.startsWith("http")
                    ? t
                    : `${baseUrl}${t}`;
                } else if (
                  thumb.data &&
                  Array.isArray(thumb.data) &&
                  thumb.data[0]?.attributes?.url
                ) {
                  const t = thumb.data[0].attributes.url as string;
                  thumbnailUrl = t.startsWith("http")
                    ? t
                    : `${baseUrl}${t}`;
                }
              }

              return {
                id: v.id,
                name_variant: src?.name_variant || "",
                SKU: src?.SKU || "",
                inventory: src?.inventory ?? 0,
                default_price:
                  src?.default_price !== undefined && src?.default_price !== null
                    ? Number(src.default_price)
                    : null,
                sale_price:
                  src?.sale_price !== undefined && src?.sale_price !== null
                    ? Number(src.sale_price)
                    : null,
                weight:
                  src?.weight !== undefined && src?.weight !== null
                    ? Number(src.weight)
                    : null,
                package: (src?.package as "bag" | "box" | undefined) || "",
                thumbnail: thumbnailUrl,
              } as VariantRow;
            })
          : [];

        if (!isMounted) return;

        setProductForm({
          title: productTitle,
          sku: productSku,
          productType,
          teaType,
          ingredient,
          finished_goods: finishedGoods,
          description: descriptionText,
          imageUrl,
          attributes,
        });
        setVariants(flat);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Không thể tải dữ liệu sản phẩm.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, token, hasHydrated]);

  const totalInventory = variants.reduce(
    (acc, v) => acc + (v.inventory ?? 0),
    0,
  );

  // Lấy tea làm gốc, chỉ hiển thị các thuộc tính liên quan đến trà khi là sản phẩm trà
  const isTea = productForm.productType === "tea";
  const hasProductId = !!productId;

  const addVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name_variant: "",
        SKU: "",
        default_price: null,
        sale_price: null,
        inventory: 0,
      },
    ]);
  };

  const removeVariantRow = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    key: keyof VariantRow,
    value: string,
  ) => {
    setVariants((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (key === "default_price" || key === "sale_price") {
          return { ...row, [key]: value === "" ? null : Number(value) };
        }
        if (key === "inventory" || key === "weight") {
          return { ...row, [key]: value === "" ? 0 : Number(value) };
        }
        return { ...row, [key]: value };
      }),
    );
  };

  const handleSaveSingleVariant = async (index: number) => {
    if (!hasProductId) {
      alert("Vui lòng tạo và lưu sản phẩm trước khi thêm biến thể.");
      return;
    }
    if (!token) {
      alert("Thiếu token xác thực. Vui lòng đăng nhập lại.");
      return;
    }

    const variant = variants[index];
    if (!variant) return;

    const isNew = typeof variant.id === "string" && variant.id.startsWith("new-");

    const payload: any = {
      name_variant: variant.name_variant,
      SKU: variant.SKU,
      inventory: variant.inventory ?? 0,
      default_price: variant.default_price ?? 0,
      sale_price: variant.sale_price ?? 0,
      weight: variant.weight ?? null,
      package: variant.package || null,
      product: productId,
    };

    try {
      setIsSavingVariants(true);

      if (isNew) {
        // Tạo mới biến thể
        await strapiClient("/api/product-variants", {
          method: "POST",
          requiresAuth: true,
          token,
          body: JSON.stringify({ data: payload }),
        });
      } else {
        // Cập nhật biến thể hiện có
        await strapiClient(`/api/product-variants/${variant.id}`, {
          method: "PUT",
          requiresAuth: true,
          token,
          body: JSON.stringify({ data: payload }),
        });
      }

      alert("Lưu biến thể thành công.");
    } catch (err: any) {
      console.error("Save single variant error", err);
      alert(err?.message || "Không thể lưu biến thể.");
    } finally {
      setIsSavingVariants(false);
    }
  };

  const handleSaveVariants = async () => {
    if (!token) {
      alert("Thiếu token xác thực. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      setIsSavingVariants(true);
      // TODO: Gọi API lưu biến thể (bulk update) ở backend.
      console.log("Variants to save", variants);
      alert("Đã chuẩn bị dữ liệu biến thể để lưu (chưa nối API backend).");
    } catch (err: any) {
      console.error("Save variants error", err);
      alert(err?.message || "Không thể lưu biến thể.");
    } finally {
      setIsSavingVariants(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (!hasHydrated) return;

      if (!token) {
        alert("Thiếu token xác thực. Vui lòng đăng nhập lại.");
        return;
      }

      if (!productForm.title.trim()) {
        alert("Vui lòng nhập tên sản phẩm.");
        return;
      }

      setIsSavingProduct(true);

      const payload: any = {
        title: productForm.title.trim(),
        sku: productForm.sku.trim() || undefined,
        productType: productForm.productType || undefined,
        teaType: productForm.teaType || undefined,
        ingredient: productForm.ingredient || undefined,
        finished_goods: productForm.finished_goods || undefined,
        // Lưu mô tả dưới dạng HTML (đã sinh từ Lexical)
        description: productForm.description || undefined,
      };
      if (!hasProductId) {
        // Tạo mới sản phẩm
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
        // Upload ảnh (nếu có) sau khi tạo mới sản phẩm
        if (pendingImageFile) {
          try {
            setIsUploadingImage(true);
            const formData = new FormData();
            formData.append("files", pendingImageFile, pendingImageFile.name);
            // Gửi cả sku (nếu có) và productId để backend gắn ảnh đúng sản phẩm
            if (payload.sku) {
              formData.append("sku", payload.sku);
            }
            formData.append("productId", String(newId));

            const apiUrl =
              process.env.NEXT_PUBLIC_STRAPI_URL ||
              process.env.NEXT_PUBLIC_API_URL ||
              "http://192.168.31.187:1337";

            const resUpload = await fetch(
              `${apiUrl}/api/products/upload-image`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              },
            );

            if (resUpload.ok) {
              const json = await resUpload.json();
              const uploaded = json?.data;
              const uploadedFile = Array.isArray(uploaded)
                ? uploaded[0]
                : uploaded;

              if (uploadedFile) {
                // Gắn media vào field images của product
                try {
                  await strapiClient<any>(`/api/products/${newId}`, {
                    method: "PUT",
                    requiresAuth: true,
                    token,
                    body: JSON.stringify({
                      data: {
                        images: uploadedFile.id,
                      },
                    }),
                  });
                } catch (linkErr) {
                  console.error("Link image to product error:", linkErr);
                }

                if (uploadedFile.url) {
                  const url =
                    uploadedFile.url.startsWith("http") ||
                    uploadedFile.url.startsWith("https")
                      ? uploadedFile.url
                      : `${apiUrl}${uploadedFile.url}`;
                  setProductForm((f) => ({
                    ...f,
                    imageUrl: url,
                  }));
                }

                setPendingImageFile(null);
              }
            }
          } catch (err) {
            console.error("Upload image after create error:", err);
          } finally {
            setIsUploadingImage(false);
          }
        }

        router.replace(`/staff/inventory/${newId}`);
      } else {
        // Cập nhật sản phẩm hiện có
        await strapiClient<any>(`/api/products/${productId}`, {
          method: "PUT",
          requiresAuth: true,
          token,
          body: JSON.stringify({ data: payload }),
        });
        // Upload ảnh (nếu có) sau khi cập nhật sản phẩm
        if (pendingImageFile && productId) {
          try {
            setIsUploadingImage(true);
            const formData = new FormData();
            formData.append("files", pendingImageFile, pendingImageFile.name);
            if (payload.sku) {
              formData.append("sku", payload.sku);
            }
            formData.append("productId", String(productId));

            const apiUrl =
              process.env.NEXT_PUBLIC_STRAPI_URL ||
              process.env.NEXT_PUBLIC_API_URL ||
              "http://192.168.31.187:1337";

            const resUpload = await fetch(
              `${apiUrl}/api/products/upload-image`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              },
            );

            if (resUpload.ok) {
              const json = await resUpload.json();
              const uploaded = json?.data;
              const uploadedFile = Array.isArray(uploaded)
                ? uploaded[0]
                : uploaded;

              if (uploadedFile) {
                try {
                  await strapiClient<any>(`/api/products/${productId}`, {
                    method: "PUT",
                    requiresAuth: true,
                    token,
                    body: JSON.stringify({
                      data: {
                        images: uploadedFile.id,
                      },
                    }),
                  });
                } catch (linkErr) {
                  console.error("Link image to product error:", linkErr);
                }

                if (uploadedFile.url) {
                  const url =
                    uploadedFile.url.startsWith("http") ||
                    uploadedFile.url.startsWith("https")
                      ? uploadedFile.url
                      : `${apiUrl}${uploadedFile.url}`;
                  setProductForm((f) => ({
                    ...f,
                    imageUrl: url,
                  }));
                }

                setPendingImageFile(null);
              }
            }
          } catch (err) {
            console.error("Upload image after update error:", err);
          } finally {
            setIsUploadingImage(false);
          }
        }

        alert("Đã lưu thông tin sản phẩm.");
      }
    } catch (err: any) {
      console.error("Save product error", err);
      alert(err?.message || "Không thể lưu sản phẩm.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Đang tải dữ liệu sản phẩm...</span>
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && (
        <>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {hasProductId ? "Kho hàng sản phẩm" : "Tạo sản phẩm mới"}
            </h1>
            {hasProductId && (
              <p className="text-muted-foreground mt-1">
                Tổng tồn kho (tất cả biến thể):{" "}
                <span className="font-semibold">
                  {totalInventory.toLocaleString("vi-VN")}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Thông tin cơ bản sản phẩm */}
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
                value={productForm.title}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, title: e.target.value }))
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
                  value={productForm.sku}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, sku: e.target.value }))
                  }
                  placeholder="Nhập SKU..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productType">Loại sản phẩm</Label>
              <Select
                value={productForm.productType || undefined}
                onValueChange={(value) =>
                  setProductForm((f) => ({ ...f, productType: value }))
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

            {isTea && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="teaType">Loại trà</Label>
                  <Select
                    value={productForm.teaType || undefined}
                    onValueChange={(value) =>
                      setProductForm((f) => ({ ...f, teaType: value }))
                    }
                  >
                    <SelectTrigger id="teaType">
                      <SelectValue placeholder="Chọn loại trà" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="white">Bạch (white)</SelectItem>
                      <SelectItem value="green">Lục (green)</SelectItem>
                      <SelectItem value="yellow">Hoàng (yellow)</SelectItem>
                      <SelectItem value="pink">Hồng (pink)</SelectItem>
                      <SelectItem value="black">Hắc (black)</SelectItem>
                      <SelectItem value="scent">Hàm Hương (scent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredient">Thành phần</Label>
                  <Select
                    value={productForm.ingredient || undefined}
                    onValueChange={(value) =>
                      setProductForm((f) => ({ ...f, ingredient: value }))
                    }
                  >
                    <SelectTrigger id="ingredient">
                      <SelectValue placeholder="Chọn thành phần" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shan_tuyet">Shan Tuyết</SelectItem>
                      <SelectItem value="trung_du">Trung Du</SelectItem>
                      <SelectItem value="o_long">Ô Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finished_goods">Thành phẩm</Label>
                  <Select
                    value={productForm.finished_goods || undefined}
                    onValueChange={(value) =>
                      setProductForm((f) => ({ ...f, finished_goods: value }))
                    }
                  >
                    <SelectTrigger id="finished_goods">
                      <SelectValue placeholder="Chọn thành phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diep_tra">Diệp trà</SelectItem>
                      <SelectItem value="doan_tra">Đoàn trà</SelectItem>
                      <SelectItem value="mat_tra">Mạt trà</SelectItem>
                      <SelectItem value="vien_tra">Viên trà</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Ảnh sản phẩm (preview + upload) */}
            <div className="space-y-2">
              <Label>Hình ảnh sản phẩm</Label>
              <div className="flex items-start gap-4">
                <div className="w-40 h-40 border rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  {productForm.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={productForm.imageUrl}
                      alt={productForm.title || "Product image"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center px-2">
                      Chưa có hình ảnh
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingImage || !token}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e: any) => {
                        const file = e.target.files?.[0] as File | undefined;
                        if (!file) return;

                        setPendingImageFile(file);

                        // Preview local trước, upload thật khi bấm "Lưu sản phẩm"
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          setProductForm((f) => ({
                            ...f,
                            imageUrl: result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      };

                      input.click();
                    }}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Chọn ảnh
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Ảnh sẽ được upload lên server sau khi bạn bấm{" "}
                    <strong>Lưu sản phẩm</strong>.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Mô tả sản phẩm (Lexical template) */}
          <div className="p-4 border rounded-lg bg-card space-y-4">
            <h2 className="text-lg font-semibold">Mô tả sản phẩm</h2>
            <div className="space-y-2">
              <Label className="text-sm">Mô tả chi tiết</Label>
              <LexicalDescriptionEditor
                value={productForm.description}
                onChange={(val) =>
                  setProductForm((f) => ({ ...f, description: val }))
                }
              />
              <div className="mt-3 space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Live preview
                </Label>
                <div className="border rounded-md bg-background/40 px-3 py-2 text-sm prose prose-sm max-w-none">
                  {productForm.description ? (
                    <div
                      // Preview HTML được sinh bởi Lexical
                      dangerouslySetInnerHTML={{
                        __html: productForm.description,
                      }}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Nội dung xem trước sẽ hiển thị tại đây.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan & danh sách biến thể */}
        {hasProductId ? (
          <>
            <div className="p-4 border rounded-lg bg-card space-y-2">
              <h2 className="text-lg font-semibold">Tổng quan tồn kho</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Số biến thể đang quản lý
                </span>
                <span className="text-xl font-bold">{variants.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tổng tồn kho
                </span>
                <span className="text-xl font-bold text-green-600">
                  {totalInventory.toLocaleString("vi-VN")}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full gap-2"
                onClick={addVariantRow}
              >
                <Plus className="h-4 w-4" />
                Thêm biến thể mới
              </Button>
            </div>

            <VariantCards
              variants={variants}
              productImageUrl={productForm.imageUrl}
              onChange={handleVariantChange}
              onAdd={addVariantRow}
              onRemove={removeVariantRow}
              onSave={handleSaveVariants}
              isSaving={isSavingVariants}
              onSaveVariant={handleSaveSingleVariant}
            />
          </>
        ) : (
          <div className="p-4 border rounded-lg bg-card text-sm text-muted-foreground">
            Vui lòng tạo và lưu sản phẩm trước, sau đó bạn có thể thêm các biến
            thể (variant) cho sản phẩm này.
          </div>
        )}

        {/* Nút lưu sản phẩm (create / update) */}
        <div className="flex justify-end">
          <Button
            type="button"
            className="gap-2"
            onClick={handleSaveProduct}
            disabled={isSavingProduct}
          >
            {isSavingProduct ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang lưu sản phẩm...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu sản phẩm
              </>
            )}
          </Button>
        </div>
        </>
      )}
    </div>
  );
}

