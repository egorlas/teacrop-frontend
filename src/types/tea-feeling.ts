/**
 * Axis keys for the Tea Feeling matrix.
 * Y: emotional / social state. X: weather / environment.
 */
export const FEELING_AXIS_Y_KEYS = [
  "vui",
  "buon",
  "mot_minh",
  "ban_be",
  "nhom_hop",
  "gia_dinh",
] as const;

export const FEELING_AXIS_X_KEYS = [
  "nong",
  "lanh",
  "kho",
  "am",
  "mua",
  "nang",
] as const;

export type FeelingAxisY = (typeof FEELING_AXIS_Y_KEYS)[number];
export type FeelingAxisX = (typeof FEELING_AXIS_X_KEYS)[number];

export type TeaFeelingMatrixKey = `${FeelingAxisY}:${FeelingAxisX}`;

export type TeaFeelingAxisLabels = {
  y: Record<FeelingAxisY, string>;
  x: Record<FeelingAxisX, string>;
};

/** Một sản phẩm trà gợi ý trong ô — CMS có thể map từng dòng. */
export type TeaFeelingProductItem = {
  id: string;
  name: string;
  description: string;
  /** Ảnh minh họa (optional). */
  imageUrl?: string;
  /** Đích nút «Gọi trà» — ví dụ `/products?search=...`. */
  orderHref: string;
  /** Chi tiết mở rộng — hiển thị trong popup (đặc biệt trên mobile). */
  smell: string;
  taste: string;
  origin: string;
  story: string;
};

export type TeaFeelingCell = {
  y: FeelingAxisY;
  x: FeelingAxisX;
  /** Danh sách gợi ý (demo 3) cho tổ hợp cảm xúc × thời tiết. */
  products: TeaFeelingProductItem[];
};

/** Serializable bundle for SSR or API — ready for Strapi / headless CMS. */
export type TeaFeelingMatrixPayload = {
  version: number;
  labels: TeaFeelingAxisLabels;
  cells: TeaFeelingCell[];
};

export type TeaFeelingSelection = {
  y: FeelingAxisY;
  x: FeelingAxisX;
} | null;
