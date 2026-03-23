import { TEA_FEELING_LABELS } from "@/data/tea-feeling/labels";
import { teaFeelingImageAt } from "@/data/tea-feeling/teaFeelingImages";
import {
  FEELING_AXIS_X_KEYS,
  FEELING_AXIS_Y_KEYS,
  type FeelingAxisX,
  type FeelingAxisY,
  type TeaFeelingCell,
  type TeaFeelingProductItem,
} from "@/types/tea-feeling";

function productsSearchHref(name: string): string {
  const q = new URLSearchParams();
  q.set("search", name);
  q.set("productType", "tea");
  return `/products?${q.toString()}`;
}

/**
 * Demo: 3 sản phẩm / ô — tên & mô tả phụ thuộc nhãn cảm xúc × thời tiết.
 * Thay toàn bộ hàm này bằng dữ liệu CMS khi tích hợp.
 */
function buildDemoProductsForCell(
  y: FeelingAxisY,
  x: FeelingAxisX,
  linearIndex: number,
): TeaFeelingProductItem[] {
  const mood = TEA_FEELING_LABELS.y[y];
  const weather = TEA_FEELING_LABELS.x[x];
  const base = linearIndex * 3;

  const names = [
    `${mood} · ${weather} — Thanh mát`,
    `${mood} · ${weather} — Ấm dịu`,
    `${mood} · ${weather} — Cân bằng`,
  ];

  const descriptions = [
    `Gợi ý nhẹ cho khoảnh khắc ${mood.toLowerCase()} khi trời ${weather.toLowerCase()} — uống nóng hay lạnh đều ổn.`,
    `Blend ôm cảm xúc và tiết trời: hậu vị sạch, không gắt — phù hợp nhấp từ từ.`,
    `Tông trà ổn định, dễ chia sẻ — gợi ý khi bạn muốn một lựa chọn an toàn mà vẫn đủ chiều.`,
  ];

  const smells = [
    "Hoa nhài thanh, thoang thoảng; nền lá xanh ấm.",
    "Mật ong nhẹ, gỗ rang mờ — ấm và sạch.",
    "Quế hoa, cốm non — dễ nhận ra, không nồng.",
  ];
  const tastes = [
    "Ngọt dịu đầu lưỡi, chát nhẹ cuối — cân bằng.",
    "Tròn, mềm, hậu ngọt kéo dài vài nhịp thở.",
    "Thanh, sạch cổ họng — uống liền mạch được.",
  ];
  const origins = [
    "Lá tuyển cao nguyên, mùa xuân — demo nguồn gốc.",
    "Vùng trồng Shan cổ thụ — demo vùng đất.",
    "Đồi chè ôn đới ẩm — demo khí hậu lý tưởng.",
  ];
  const stories = [
    `Một lần hái trễ sương, người làm trà giữ lại mẻ lá đó — hợp khi bạn ${mood.toLowerCase()} và trời ${weather.toLowerCase()}.`,
    "Câu chuyện ngắn: ấm được chọn vì độ dày vừa — không vội, không vướng.",
    "Gợi ý này gắn với khoảnh khắc nhiều người cùng nhớ — trà là phần chung nhỏ.",
  ];

  return [0, 1, 2].map((i) => {
    const name = names[i] ?? names[0];
    const id = `${y}:${x}:p${i + 1}`;
    return {
      id,
      name,
      description: descriptions[i] ?? descriptions[0],
      imageUrl: teaFeelingImageAt(base + i),
      orderHref: productsSearchHref(name),
      smell: smells[i] ?? smells[0],
      taste: tastes[i] ?? tastes[0],
      origin: origins[i] ?? origins[0],
      story: stories[i] ?? stories[0],
    };
  });
}

export function buildMockTeaFeelingCells(): TeaFeelingCell[] {
  const cells: TeaFeelingCell[] = [];
  FEELING_AXIS_Y_KEYS.forEach((y, yi) => {
    FEELING_AXIS_X_KEYS.forEach((x, xi) => {
      const linearIndex = yi * FEELING_AXIS_X_KEYS.length + xi;
      cells.push({
        y,
        x,
        products: buildDemoProductsForCell(y, x, linearIndex),
      });
    });
  });
  return cells;
}
