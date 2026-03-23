import { TEA_FEELING_LABELS } from "@/data/tea-feeling/labels";
import { buildMockTeaFeelingCells } from "@/data/tea-feeling/mockMatrix";
import type {
  FeelingAxisX,
  FeelingAxisY,
  TeaFeelingMatrixKey,
  TeaFeelingMatrixPayload,
  TeaFeelingProductItem,
} from "@/types/tea-feeling";

const MOCK_CELLS = buildMockTeaFeelingCells();

const MOCK_PRODUCTS_BY_KEY = new Map<TeaFeelingMatrixKey, TeaFeelingProductItem[]>(
  MOCK_CELLS.map((c) => [`${c.y}:${c.x}` as TeaFeelingMatrixKey, c.products]),
);

/** Current mock payload — swap for CMS fetch in repository. */
export function getMockTeaFeelingMatrixPayload(): TeaFeelingMatrixPayload {
  return {
    version: 2,
    labels: TEA_FEELING_LABELS,
    cells: MOCK_CELLS,
  };
}

/** Sản phẩm gợi ý cho một ô — dùng repository / CMS sau này. */
export function getMockTeaFeelingProducts(
  y: FeelingAxisY,
  x: FeelingAxisX,
): TeaFeelingProductItem[] | null {
  return MOCK_PRODUCTS_BY_KEY.get(`${y}:${x}` as TeaFeelingMatrixKey) ?? null;
}
