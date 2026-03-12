import { ProductsPageClient } from "./ProductsPageClient";

// Route này dùng useSearchParams mạnh, nên ép render động để tránh lỗi prerender / export.
export const dynamic = "force-dynamic";

export default function ProductsPage() {
  return <ProductsPageClient />;
}


