import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductDetails } from "@/components/products/ProductDetails";
import { ProductDescription } from "@/components/products/ProductDescription";
import { ProductInfo } from "@/components/products/ProductInfo";
import { ProductReviews } from "@/components/products/ProductReviews";
import { ProductComments } from "@/components/products/ProductComments";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { getPublicProductBySlug, getProducts } from "@/lib/api";
import { Button } from "@/components/ui/button";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getPublicProductBySlug(id);
  if (!product) {
    return buildMetadata({
      title: "Không tìm thấy sản phẩm",
      description: "Sản phẩm không tồn tại",
    });
  }

  return buildMetadata({
    title: product.name,
    description: product.note || product.description || `Chi tiết sản phẩm ${product.name}`,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getPublicProductBySlug(id);
  if (!product) {
    notFound();
  }

  // Fetch related products (exclude current product)
  const response = await getProducts({ populate: '*' });
  const relatedProducts = response.data
    .filter((p) => p.id !== id)
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-24">
      <Container>

        {/* Chi tiết sản phẩm */}
        <div id="product-details-section">
          <ProductDetails product={product} />
        </div>

        {/* Mô tả sản phẩm */}
        <ProductDescription description={product.description} />

        {/* Thông tin sản phẩm */}
        <ProductInfo product={product} />

        {/* Đánh giá */}
        <ProductReviews reviews={product.reviews} />

        {/* Bình luận */}
        <ProductComments comments={product.comments} />

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      </Container>
    </section>
  );
}

