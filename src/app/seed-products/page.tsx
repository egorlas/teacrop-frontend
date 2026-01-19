"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { seedProducts } from "@/lib/api";
import { toast, Toaster } from "sonner";

export default function SeedProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await seedProducts();
      setResult(response);

      if (response.success) {
        toast.success(
          `Đã seed ${response.summary?.created || 0} sản phẩm mới, ${response.summary?.exists || 0} sản phẩm đã tồn tại`
        );
      } else {
        toast.error(response.error || "Có lỗi xảy ra khi seed products");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
      setResult({ success: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Seed Products từ Frontend</h1>
        <p className="text-muted-foreground mb-4">
          Chức năng này sẽ thêm các sản phẩm mẫu từ frontend vào Strapi backend.
          Các sản phẩm đã tồn tại sẽ được bỏ qua.
        </p>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
            ⚙️ Cấu hình cần thiết:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li><strong>Quan trọng:</strong> Đảm bảo Strapi server đang chạy và đã restart sau khi tạo content types</li>
            <li>Tạo API Token trong Strapi Admin Panel:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Mở <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://192.168.31.187:1337/admin</code></li>
                <li>Settings → API Tokens → Create new API Token</li>
                <li><strong>Chọn Type: <span className="text-red-600 dark:text-red-400">Full access</span></strong> (khuyến nghị - sẽ có tất cả quyền)</li>
                <li className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  ⚠️ Nếu không thấy Product trong Custom permissions, hãy:
                  <ul className="list-circle list-inside ml-4 mt-1">
                    <li>Restart Strapi server (dừng và chạy lại npm run develop)</li>
                    <li>Hoặc chọn Full access thay vì Custom</li>
                    <li>Hoặc tìm "api::product.product" trong danh sách</li>
                  </ul>
                </li>
                <li>Copy token được tạo (chỉ hiện 1 lần!)</li>
              </ul>
            </li>
            <li>Thêm token vào <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">viettea-web/.env.local</code>:
              <pre className="mt-1 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs overflow-x-auto">
STRAPI_API_TOKEN=your-token-here
</pre>
            </li>
            <li>Restart Next.js dev server sau khi thêm token</li>
          </ol>
        </div>

        <Button onClick={handleSeed} disabled={loading}>
          {loading ? "Đang xử lý..." : "Seed Products"}
        </Button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h2 className="font-semibold mb-2">Kết quả:</h2>
              {result.summary && (
                <div className="space-y-1 text-sm">
                  <p>✅ Tổng số: {result.summary.total}</p>
                  <p>✅ Đã tạo: {result.summary.created}</p>
                  <p>⚠️ Đã tồn tại: {result.summary.exists}</p>
                  <p>❌ Lỗi: {result.summary.errors}</p>
                </div>
              )}

              {result.results && result.results.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Chi tiết:</h3>
                  <div className="space-y-1 text-sm max-h-60 overflow-y-auto">
                    {result.results.map((r: any, idx: number) => (
                      <p key={idx}>
                        {r.status === "created" ? "✅" : "⚠️"} {r.product} ({r.status})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h3 className="font-semibold mb-2 text-destructive">❌ Lỗi:</h3>
                  <p className="text-sm text-destructive mb-2">{result.error}</p>
                  {result.hint && (
                    <p className="text-sm text-muted-foreground mt-2">
                      💡 <strong>Hướng dẫn:</strong> {result.hint}
                    </p>
                  )}
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2 text-destructive">Lỗi chi tiết:</h3>
                  <div className="space-y-2 text-sm">
                    {result.errors.map((e: any, idx: number) => (
                      <div key={idx} className="p-2 bg-destructive/10 rounded border border-destructive/20">
                        <p className="text-destructive font-semibold">❌ {e.product}:</p>
                        <pre className="text-xs text-destructive mt-1 whitespace-pre-wrap break-words">
                          {e.error}
                        </pre>
                      </div>
                    ))}
                  </div>
                  {result.errors.some((e: any) => e.error.includes('405') || e.error.includes('Method Not Allowed')) && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        ⚠️ Có vẻ như API Token chưa có quyền Create Products:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
                        <li>Vào Strapi Admin → Settings → API Tokens</li>
                        <li>Click vào token của bạn (hoặc tạo mới)</li>
                        <li>Đảm bảo chọn <strong>Full access</strong> hoặc enable <strong>Product → Create</strong> permission</li>
                        <li>Save và thử lại</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
      <Toaster position="top-right" />
    </div>
  );
}

