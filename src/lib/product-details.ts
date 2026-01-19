import type { Product, ProductSpecification } from "@/types/product";
import type { Review, Comment } from "@/types/review";
import { sampleProducts } from "./products";

// Dữ liệu mẫu cho reviews
const sampleReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      userId: "u1",
      userName: "Nguyễn Văn A",
      rating: 5,
      title: "Trà sen tuyệt vời",
      comment: "Trà sen có hương thơm đặc trưng, vị ngọt thanh. Sẽ mua lại lần nữa!",
      createdAt: "2024-01-15T10:00:00Z",
      verified: true,
    },
    {
      id: "r2",
      userId: "u2",
      userName: "Trần Thị B",
      rating: 4,
      title: "Chất lượng tốt",
      comment: "Trà ngon, đóng gói cẩn thận. Giao hàng nhanh.",
      createdAt: "2024-01-20T14:30:00Z",
      verified: true,
    },
  ],
  "2": [
    {
      id: "r3",
      userId: "u3",
      userName: "Lê Văn C",
      rating: 5,
      title: "Trà Oolong xuất sắc",
      comment: "Vị trà đậm đà, thơm ngát. Rất đáng giá!",
      createdAt: "2024-02-01T09:15:00Z",
      verified: true,
    },
  ],
};

// Dữ liệu mẫu cho comments
const sampleComments: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1",
      userId: "u4",
      userName: "Phạm Văn D",
      content: "Cho mình hỏi trà này có thể pha được bao nhiêu lần?",
      createdAt: "2024-01-16T11:00:00Z",
      likes: 2,
    },
    {
      id: "c2",
      userId: "u5",
      userName: "Hoàng Thị E",
      content: "Mình đã thử, có thể pha được 3-4 lần vẫn còn vị ngon nhé!",
      createdAt: "2024-01-16T15:30:00Z",
      likes: 5,
      replies: [
        {
          id: "c2-1",
          userId: "u4",
          userName: "Phạm Văn D",
          content: "Cảm ơn bạn nhé!",
          createdAt: "2024-01-16T16:00:00Z",
          likes: 1,
        },
      ],
    },
  ],
  "2": [
    {
      id: "c3",
      userId: "u6",
      userName: "Võ Văn F",
      content: "Trà này có bảo quản được lâu không?",
      createdAt: "2024-02-02T10:00:00Z",
      likes: 1,
    },
  ],
};

// Thông số kỹ thuật mẫu
const sampleSpecifications: Record<string, ProductSpecification[]> = {
  "1": [
    { label: "Trọng lượng", value: "100g" },
    { label: "Xuất xứ", value: "Việt Nam" },
    { label: "Hạn sử dụng", value: "24 tháng" },
    { label: "Bảo quản", value: "Nơi khô ráo, thoáng mát, tránh ánh sáng trực tiếp" },
    { label: "Quy cách", value: "Hộp thiếc cao cấp" },
  ],
  "2": [
    { label: "Trọng lượng", value: "100g" },
    { label: "Xuất xứ", value: "Việt Nam" },
    { label: "Hạn sử dụng", value: "24 tháng" },
    { label: "Bảo quản", value: "Nơi khô ráo, thoáng mát" },
  ],
};

// Mô tả chi tiết mẫu
const sampleDescriptions: Record<string, string> = {
  "1": `Trà Sen Bách Diệp là một trong những sản phẩm trà cao cấp nhất của chúng tôi. Được chọn lọc từ những búp trà xanh tươi non nhất, sau đó được ướp với những cánh hoa sen tươi trong nhiều đêm để hấp thụ trọn vẹn hương thơm đặc trưng của sen.

Sản phẩm được chế biến theo phương pháp truyền thống, giữ nguyên được hương vị tự nhiên và các dưỡng chất quý giá. Mỗi tách trà sen mang đến cảm giác thanh tao, thanh lọc cơ thể, giúp tinh thần tỉnh táo và sảng khoái.

Trà Sen Bách Diệp thích hợp để thưởng thức vào buổi sáng hoặc chiều, có thể pha được 3-4 lần mà vẫn giữ được hương vị đậm đà.`,
  "2": `Trà Oolong Tứ Quý là dòng trà được chế biến từ những lá trà tươi non nhất, trải qua quá trình lên men một phần đặc biệt, tạo nên hương vị độc đáo không thể nhầm lẫn.

Với màu vàng hổ phách đẹp mắt và hương thơm ngọt ngào, trà Oolong Tứ Quý mang đến trải nghiệm thưởng thức tuyệt vời. Vị trà đậm đà nhưng không gắt, có hậu vị ngọt thanh kéo dài.`,
  "3": `Trà Xanh Thái Nguyên là đặc sản nổi tiếng của vùng đất Thái Nguyên. Được trồng trên những vùng cao nguyên với khí hậu mát mẻ, đất đai màu mỡ, tạo nên những lá trà chất lượng cao với hương vị đặc trưng.`,
  "4": `Trà Ô Long Kim Cương là sản phẩm cao cấp được chế biến từ giống trà quý hiếm. Với quy trình chế biến công phu, trà có vị ngọt thanh, hậu vị kéo dài và mang lại cảm giác thư giãn tuyệt vời.`,
  "5": `Trà Lài Bắc Sơn được ướp với hoa lài tươi, mang đến hương thơm ngọt ngào, quyến rũ. Vị trà thanh mát, phù hợp cho những ai yêu thích hương hoa tự nhiên.`,
  "6": `Trà Shan Tuyết Cổ Thụ được hái từ những cây trà cổ thụ hàng trăm năm tuổi trên núi cao. Với độ cao và khí hậu đặc biệt, trà có hương vị mạnh mẽ, đậm đà, được đánh giá là một trong những loại trà ngon nhất Việt Nam.`,
};

// Helper để tính điểm đánh giá trung bình
function calculateAverageRating(reviews?: Review[]): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// Helper để lấy sản phẩm chi tiết
export function getProductDetails(id: string): Product | undefined {
  const product = sampleProducts.find((p) => p.id === id);
  if (!product) return undefined;

  const reviews = sampleReviews[id] || [];
  const comments = sampleComments[id] || [];
  const specifications = sampleSpecifications[id] || [];
  const description = sampleDescriptions[id] || "";

  return {
    ...product,
    description,
    specifications,
    reviews,
    comments,
    averageRating: calculateAverageRating(reviews),
    reviewCount: reviews.length,
  };
}

// Helper để lấy sản phẩm liên quan (loại trừ sản phẩm hiện tại)
export function getRelatedProducts(currentProductId: string, limit = 3): Product[] {
  return sampleProducts
    .filter((p) => p.id !== currentProductId)
    .slice(0, limit)
    .map((p) => ({
      ...p,
      description: sampleDescriptions[p.id] || "",
      specifications: sampleSpecifications[p.id] || [],
      reviews: sampleReviews[p.id] || [],
      comments: sampleComments[p.id] || [],
      averageRating: calculateAverageRating(sampleReviews[p.id]),
      reviewCount: sampleReviews[p.id]?.length || 0,
    }));
}

