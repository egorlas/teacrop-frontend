import type { Review, Comment } from "./review";

export type Product = {
  id: string; // From backend: id (mapped to string)
  name: string; // From backend: title (renamed to name in transform)
  slug?: string; // From backend: slug
  price: number; // From backend: price (decimal)
  image?: string; // From backend: images[0].url (full URL)
  note?: string; // From backend: description (same as description, for short description)
  description?: string; // From backend: description (blocks/richtext)
  aliases?: string[]; // From backend: attributes.aliases
  specifications?: ProductSpecification[]; // From backend: attributes.specifications
  // Optional backend fields (can be added if needed):
  sku?: string; // From backend: sku
  inventory?: number; // From backend: inventory
  productType?: "trà" | "trà cụ"; // From backend: productType (enum)
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
  