import type { Product } from "@/types/product";

/**
 * Mock products data - Giai đoạn 1: dữ liệu tĩnh
 * Sau này sẽ thay thế bằng Strapi/database
 */
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Trà Sen Tây Hồ",
    note: "Trà sen cao cấp với hương thơm đặc trưng, được ướp từ hoa sen tươi",
    price: 450000,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
    aliases: [
      "tra sen tay ho",
      "tra sen",
      "sen tay ho",
      "trà sen",
      "trà sen tây hồ",
      "tra sen tayho",
      "sen ho",
    ],
  },
  {
    id: "2",
    name: "Trà Lài",
    note: "Trà lài thơm ngát với những bông hoa lài tươi, thanh mát",
    price: 290000,
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&q=80",
    aliases: [
      "tra lai",
      "trà lài",
      "tra jasmine",
      "trà hoa lài",
      "tra hoa lai",
      "lài",
      "jasmine",
    ],
  },
  {
    id: "3",
    name: "Trà Ô Long",
    note: "Trà Oolong truyền thống với vị đậm đà, thơm ngát, hậu vị kéo dài",
    price: 380000,
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80",
    aliases: [
      "tra o long",
      "trà ô long",
      "oolong",
      "o long",
      "tra oolong",
      "oolong tu quy",
      "tra o long tu quy",
    ],
  },
  {
    id: "4",
    name: "Trà Xanh Thái Nguyên",
    note: "Trà xanh đặc sản Thái Nguyên, lá trà tươi ngon, hương vị đặc trưng",
    price: 320000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    aliases: [
      "tra xanh thai nguyen",
      "trà xanh thái nguyên",
      "tra xanh",
      "trà xanh",
      "thai nguyen",
      "thái nguyên",
      "green tea",
    ],
  },
  {
    id: "5",
    name: "Trà Đen Shan Tuyết",
    note: "Trà đen cao cấp từ vùng núi Tây Bắc, vị mạnh mẽ, đậm đà",
    price: 550000,
    image: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80",
    aliases: [
      "tra den shan tuyet",
      "trà đen shan tuyết",
      "tra den",
      "trà đen",
      "shan tuyet",
      "shàn tuyết",
      "black tea",
      "tra shan tuyet",
    ],
  },
  {
    id: "6",
    name: "Trà Hoa Cúc",
    note: "Trà hoa cúc thanh mát, giúp thư giãn, phù hợp uống buổi tối",
    price: 180000,
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&q=80",
    aliases: [
      "tra hoa cuc",
      "trà hoa cúc",
      "tra cuc",
      "trà cúc",
      "hoa cuc",
      "chrysanthemum",
    ],
  },
];

