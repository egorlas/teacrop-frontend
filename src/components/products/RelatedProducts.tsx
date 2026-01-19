import type { Product } from "@/types/product";
import { ProductCard } from "@/components/ProductCard";
import { Container } from "@/components/Container";

type RelatedProductsProps = {
  products: Product[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <Container>
        <h2 className="mb-6 text-2xl font-semibold text-foreground">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}

