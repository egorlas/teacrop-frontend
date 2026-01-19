import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";

export const metadata = buildMetadata({
  title: "Về chúng tôi",
  description: "Tìm hiểu về Tea Store - thương hiệu trà Việt Nam chất lượng cao",
});

export default function AboutPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Về chúng tôi
          </h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="mb-6 text-lg text-muted-foreground">
              Tea Store được thành lập với niềm đam mê mang đến những sản phẩm trà Việt Nam chất
              lượng cao nhất cho người tiêu dùng. Chúng tôi tin rằng mỗi tách trà đều kể một câu
              chuyện về vùng đất và con người nơi nó được tạo ra.
            </p>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Sứ mệnh của chúng tôi</h2>
            <p className="mb-6 text-muted-foreground">
              Chúng tôi cam kết mang đến những sản phẩm trà được chọn lọc kỹ lưỡng từ các vùng trà
              nổi tiếng của Việt Nam. Mỗi sản phẩm đều được kiểm tra chất lượng nghiêm ngặt để đảm
              bảo mang đến trải nghiệm tốt nhất cho khách hàng.
            </p>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Giá trị cốt lõi</h2>
            <ul className="mb-6 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Chất lượng cao - Nguyên liệu tự nhiên, không chất bảo quản</li>
              <li>Truyền thống - Giữ gìn và phát huy nghệ thuật pha trà Việt Nam</li>
              <li>Uy tín - Cam kết với khách hàng về chất lượng sản phẩm</li>
              <li>Phát triển bền vững - Hỗ trợ nông dân trồng trà tại địa phương</li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

