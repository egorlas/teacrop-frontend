import Link from "next/link";
import { Container } from "@/components/Container";

export function CTA() {
  return (
    <section className="bg-primary py-16 text-primary-foreground sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Sẵn sàng khám phá thế giới trà Việt Nam?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Khám phá bộ sưu tập trà cao cấp của chúng tôi ngay hôm nay
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg bg-primary-foreground px-8 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary-foreground focus:ring-offset-2 focus:ring-offset-primary"
          >
            Xem sản phẩm
          </Link>
        </div>
      </Container>
    </section>
  );
}

