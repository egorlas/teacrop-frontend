import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sản phẩm",
  description: "Khám phá bộ sưu tập trà Việt Nam chất lượng cao của chúng tôi",
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
