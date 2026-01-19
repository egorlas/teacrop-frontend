export type Review = {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  createdAt: string; // ISO date string
  verified?: boolean; // Đã mua sản phẩm
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string; // ISO date string
  likes?: number;
  replies?: Comment[]; // Comments con (nested)
};

