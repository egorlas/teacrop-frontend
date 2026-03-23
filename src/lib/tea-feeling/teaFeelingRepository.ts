import { getMockTeaFeelingMatrixPayload, getMockTeaFeelingProducts } from "@/data/tea-feeling";
import type {
  FeelingAxisX,
  FeelingAxisY,
  TeaFeelingMatrixPayload,
  TeaFeelingProductItem,
} from "@/types/tea-feeling";

/**
 * Data access for Tea Feeling — implement a CMS-backed adapter later
 * (e.g. fetch from Strapi) without changing UI components.
 */
export type TeaFeelingRepository = {
  getMatrixPayload: () => Promise<TeaFeelingMatrixPayload>;
  getProductsForCell: (
    y: FeelingAxisY,
    x: FeelingAxisX,
  ) => Promise<TeaFeelingProductItem[] | null>;
};

function createMockRepository(): TeaFeelingRepository {
  return {
    async getMatrixPayload() {
      return getMockTeaFeelingMatrixPayload();
    },
    async getProductsForCell(y, x) {
      return getMockTeaFeelingProducts(y, x);
    },
  };
}

/** Singleton for app usage — replace with CMS repository via env when ready. */
export const teaFeelingRepository: TeaFeelingRepository = createMockRepository();
