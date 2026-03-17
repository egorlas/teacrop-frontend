import Link from "next/link";
import { ProductInventoryClient } from "@/components/staff/ProductInventoryClient";

type InventoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductInventoryPage({ params }: InventoryPageProps) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Tạo sản phẩm mới
          </span>
          <Link
            href="/staff/inventory"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Quay lại danh sách sản phẩm
          </Link>
        </div>

        <ProductInventoryClient />
      </div>
    );
  }

  const productId = Number(id);
  if (Number.isNaN(productId)) {
    return (
      <div className="p-6 text-sm text-red-600">
        ID sản phẩm không hợp lệ.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          Mã sản phẩm #{productId}
        </span>
        <Link
          href="/staff/inventory"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>

      <ProductInventoryClient productId={productId} />
    </div>
  );
}

