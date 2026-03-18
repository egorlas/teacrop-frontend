import type { Review, Comment } from "./review";

export type Product = {
  id: string; // From backend: id (mapped to string)
  name: string; // From backend: title (renamed to name in transform)
  slug?: string; // From backend: slug
  // Giá không còn lưu trực tiếp trên product, dùng theo biến thể
  price: number; // Deprecated: giữ để tương thích, luôn 0 hoặc không dùng
  // Dải giá theo variants (sale_price): "low-high"
  price_range?: string;
  image?: string; // From backend: images[0].url (full URL)
  note?: string; // From backend: description (same as description, for short description)
  description?: string; // From backend: description (blocks/richtext)
  aliases?: string[]; // From backend: attributes.aliases
  specifications?: ProductSpecification[]; // From backend: attributes.specifications
  // Optional backend fields (can be added if needed):
  sku?: string; // From backend: sku
  inventory?: number; // From backend: inventory
  productType?: "tea" | "tea_tools"; // From backend: productType (enum)
  // New enum-based filters from backend Product content-type:
  teaType?: string; // From backend: teaType (enum)
  ingredient?: string; // From backend: ingredient (enum)
  finished_goods?: string; // From backend: finished_goods (enum)
  // Attributes JSON fields:
  attributes?: {
    brand?: string;
    expiry?: string;
    origin?: string;
    weight?: string;
    package?: string;
  };
  // Biến thể sản phẩm (product_variants)
  variants?: Array<{
    id: number | string;
    name_variant: string;
    SKU?: string;
    default_price?: number | null;
    sale_price?: number | null;
    inventory?: number | null;
    weight?: number | null;
    package?: "bag" | "box" | "" | null;
    thumbnail?: string;
  }>;
  // Frontend-only fields:
  reviews?: Review[]; // Đánh giá
  comments?: Comment[]; // Bình luận
  averageRating?: number; // Điểm đánh giá trung bình
  reviewCount?: number; // Số lượng đánh giá
};

export type ProductSpecification = {
  label: string;
  value: string;
};
  