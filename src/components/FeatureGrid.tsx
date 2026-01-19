import { Leaf, Award, Truck, Heart } from "lucide-react";
import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Leaf,
    title: "Nguyên liệu từ vùng trồng trà nổi tiếng",
    description: "Chúng tôi hợp tác trực tiếp với các vùng trồng trà truyền thống tại Thái Nguyên, Lâm Đồng, và các tỉnh miền núi phía Bắc. Mỗi lá trà được hái thủ công từ những cây trà cổ thụ, đảm bảo hương vị đậm đà và nguyên chất nhất.",
    image: "https://i.pinimg.com/1200x/5e/9e/2d/5e9e2d379c4934d333247091f0e5509a.jpg",
    location: "Giàng Cao, Phúc Trìu, Tà Xùa",
  },
  {
    icon: Award,
    title: "Quy trình sản xuất nghiêm ngặt",
    description: "Từ khâu hái trà đến đóng gói, mọi công đoạn đều được kiểm soát chặt chẽ. Sản phẩm đạt tiêu chuẩn vệ sinh an toàn thực phẩm, không sử dụng chất bảo quản hay phụ gia độc hại.",
    image: "https://i.pinimg.com/736x/1e/8b/0c/1e8b0c094485d238c57a84df3a1d6a30.jpg",
    location: "Nhà máy đạt chuẩn ISO",
  },
  {
    icon: Truck,
    title: "Giao hàng nhanh chóng, đóng gói cẩn thận",
    description: "Miễn phí vận chuyển cho đơn hàng trên 500.000đ trong nội thành. Bao bì chuyên dụng giữ nguyên hương vị và chất lượng trà, đảm bảo sản phẩm đến tay bạn hoàn hảo nhất.",
    image: "https://i.pinimg.com/736x/a4/c7/87/a4c787e6965646bb782136cad81dc254.jpg",
    location: "Giao hàng toàn quốc",
  },
  {
    icon: Heart,
    title: "Chăm sóc khách hàng tận tâm",
    description: "Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ bạn 24/7. Chúng tôi cam kết đổi trả miễn phí nếu sản phẩm không đúng chất lượng như cam kết.",
    image: "https://i.pinimg.com/736x/44/49/85/444985873037e3281d2ec8adc49f4bc9.jpg",
    location: "Hỗ trợ 24/7",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <Container>
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tại sao chọn Tea Store?
          </h2>
          <p className="text-lg text-muted-foreground">
            Chúng tôi cam kết mang đến những sản phẩm trà tốt nhất với nguyên liệu được chọn lọc từ các vùng trồng trà nổi tiếng
          </p>
        </div>
        
        {/* Scroll Sections */}
        <div className="space-y-16 sm:space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/50",
                  "flex flex-col lg:flex-row",
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                )}
              >
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden bg-muted lg:h-[400px] lg:w-1/2">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:w-1/2">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
                    {feature.location}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

