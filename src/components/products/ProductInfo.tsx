import type { Product } from "@/types/product";

const getProductTypeLabel = (type?: string): string | null => {
  if (!type) return null;
  const labels: Record<string, string> = {
    tea: "Trà",
    tea_tools: "Trà cụ",
  };
  return labels[type] || type;
};

const getTeaTypeLabel = (type?: string): string | null => {
  if (!type) return null;
  const labels: Record<string, string> = {
    white: "Bạch",
    green: "Lục",
    yellow: "Hoàng",
    pink: "Hồng",
    black: "Hắc",
    scent: "Hàm Hương",
  };
  return labels[type] || type;
};

const getIngredientLabel = (ingredient?: string): string | null => {
  if (!ingredient) return null;
  const labels: Record<string, string> = {
    shan_tuyet: "Shan Tuyết",
    trung_du: "Trung Du",
    o_long: "Ô Long",
  };
  return labels[ingredient] || ingredient;
};

const getFinishedGoodsLabel = (goods?: string): string | null => {
  if (!goods) return null;
  const labels: Record<string, string> = {
    diep_tra: "Diệp trà",
    doan_tra: "Đoàn trà",
    mat_tra: "Mạt trà",
    vien_tra: "Viên trà",
  };
  return labels[goods] || goods;
};

type ProductInfoProps = {
  product: Product;
};

export function ProductInfo({ product }: ProductInfoProps) {
  const specs: Array<{ label: string; value: string }> = [];

  if (product.specifications) {
    specs.push(...product.specifications);
  }

  if (product.productType) {
    const label = getProductTypeLabel(product.productType);
    if (label) specs.push({ label: "Phân loại", value: label });
  }

  if (product.teaType) {
    const label = getTeaTypeLabel(product.teaType);
    if (label) specs.push({ label: "Loại trà", value: label });
  }

  if (product.ingredient) {
    const label = getIngredientLabel(product.ingredient);
    if (label) specs.push({ label: "Thành phần", value: label });
  }

  if (product.finished_goods) {
    const label = getFinishedGoodsLabel(product.finished_goods);
    if (label) specs.push({ label: "Thành phẩm", value: label });
  }

  if (product.attributes) {
    if (product.attributes.brand) {
      specs.push({ label: "Thương hiệu", value: product.attributes.brand });
    }
    if (product.attributes.origin) {
      specs.push({ label: "Xuất xứ", value: product.attributes.origin });
    }
    if (product.attributes.weight) {
      specs.push({ label: "Trọng lượng", value: product.attributes.weight });
    }
    if (product.attributes.package) {
      specs.push({ label: "Đóng gói", value: product.attributes.package });
    }
    if (product.attributes.expiry) {
      specs.push({ label: "Hạn sử dụng", value: product.attributes.expiry });
    }
  }

  if (product.sku) {
    specs.push({ label: "SKU", value: product.sku });
  }

  if (!specs.length) return null;

  return (
    <section className="py-8">
      <h2 className="mb-4 text-2xl font-semibold text-foreground">
        Thông tin sản phẩm
      </h2>
      <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
        <dl className="space-y-2">
          {specs.map((spec, index) => (
            <div
              key={index}
              className="flex gap-3 text-sm text-slate-700 sm:text-[13px]"
            >
              <dt className="min-w-[110px] text-slate-400">{spec.label}</dt>
              <dd className="flex-1">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

