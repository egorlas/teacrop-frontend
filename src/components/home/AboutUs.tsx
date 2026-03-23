import Link from "next/link";
import { ShapeAdBanner } from "./ShapeAdBanner";
import { Container } from "@/components/Container";

export function AboutUs() {
  return (
    <section className="bg-white py-10">
      <Container>
        <div className="mx-auto flex max-w-5xl items-stretch justify-center gap-6 lg:gap-10">
          {/* Banner trái: hình lá trà. Thêm ảnh: imageSrc="/path/to/image.jpg" */}
          <ShapeAdBanner side="left" shape="leaf" />
          <div className="min-w-0 flex-1 py-2">
            <h2 className="mb-5 text-center text-xl font-semibold tracking-tight text-gray-800 sm:text-2xl">
              Giới thiệu
            </h2>
            <div className="space-y-4 text-center text-sm leading-relaxed text-gray-600 sm:text-base">
              <p>
                <strong className="font-medium text-gray-700">Tea Love</strong> là
                thương hiệu trà cao cấp, mang đến trải nghiệm thưởng trà đích thực.
                Chúng tôi chọn lọc nguyên liệu từ những vùng trồng trà nổi tiếng, kết
                hợp bí quyết chế biến truyền thống và quy trình kiểm soát chất lượng
                chặt chẽ.
              </p>
              <p>
                Sứ mệnh của chúng tôi là lan tỏa văn hóa trà Việt, đồng hành cùng
                khách hàng trong từng tách trà an lành và tinh tế. Tea Love cam kết
                chất lượng, minh bạch nguồn gốc và phục vụ chuyên nghiệp.
              </p>
              <p>
                <Link
                  href="/about"
                  className="inline-flex items-center font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:ring-offset-1"
                >
                  Xem thêm về chúng tôi →
                </Link>
              </p>
            </div>
          </div>
          {/* Banner phải: hình ấm trà. Thêm ảnh: imageSrc="/path/to/image.jpg" */}
          <ShapeAdBanner side="right" shape="teapot" />
        </div>
      </Container>
    </section>
  );
}
