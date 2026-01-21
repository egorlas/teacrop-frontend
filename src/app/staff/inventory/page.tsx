"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, Loader2, AlertCircle, CheckCircle, AlertTriangle, DollarSign, Hash, Plus, Edit, Save } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ToastContainer, type ToastProps } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { strapiClient } from "@/lib/strapi/strapiClient";

interface InventoryProduct {
  id: number;
  title?: string;
  sku?: string;
  inventory?: number;
  price?: number;
  productType?: string;
  teaType?: string;
  ingredient?: string;
  finished_goods?: string;
  description?: any;
  images?: any;
  attributes?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductsResponse {
  data: InventoryProduct[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Transform Strapi product to flat structure
function transformProduct(product: InventoryProduct): InventoryProduct {
  // Check if structure is flat (Strapi v5) or nested (Strapi v4)
  const isFlat = !product.attributes || 'title' in product;
  
  if (isFlat) {
    return product;
  }
  
  // Transform nested structure to flat
  return {
    id: product.id,
    title: product.attributes?.title,
    sku: product.attributes?.sku,
    inventory: product.attributes?.inventory,
    price: product.attributes?.price,
    createdAt: product.attributes?.createdAt,
    updatedAt: product.attributes?.updatedAt,
  };
}

function getInventoryStatus(inventory: number | undefined): {
  label: string;
  variant: "default" | "destructive" | "secondary" | "outline";
  icon: React.ComponentType<{ className?: string }>;
} {
  if (inventory === undefined || inventory === null) {
    return {
      label: "Chưa cập nhật",
      variant: "outline",
      icon: AlertCircle,
    };
  }
  
  if (inventory === 0) {
    return {
      label: "Hết hàng",
      variant: "destructive",
      icon: AlertCircle,
    };
  }
  
  if (inventory < 10) {
    return {
      label: "Sắp hết",
      variant: "destructive",
      icon: AlertTriangle,
    };
  }
  
  if (inventory < 50) {
    return {
      label: "Còn hàng",
      variant: "secondary",
      icon: CheckCircle,
    };
  }
  
  return {
    label: "Đủ hàng",
    variant: "default",
    icon: CheckCircle,
  };
}

function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) {
    return "N/A";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function InventoryPage() {
  const { token } = useAuthStore();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [addInventoryDialogOpen, setAddInventoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [addQuantity, setAddQuantity] = useState("");
  const [isAddingInventory, setIsAddingInventory] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    title: "",
    sku: "",
    price: "",
    inventory: "",
    productType: "",
    teaType: "",
    ingredient: "",
    finished_goods: "",
    description: "",
    imageFile: null as File | null,
    imagePreview: "",
    attributeWeight: "",
    attributeOrigin: "",
    attributeBrand: "",
    attributePackage: "",
    attributeExpiry: "",
  });
  const pageSize = 25;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        "pagination[page]": String(currentPage),
        "pagination[pageSize]": String(pageSize),
        "sort": "updatedAt:desc",
      });

      // Add search filter if exists
      if (debouncedSearch.trim()) {
        queryParams.append("filters[$or][0][title][$contains]", debouncedSearch.trim());
        queryParams.append("filters[$or][1][sku][$contains]", debouncedSearch.trim());
      }

      const response = await strapiClient<ProductsResponse>(
        `/api/products?${queryParams.toString()}`,
        {
          method: "GET",
          token,
          requiresAuth: true,
        }
      );

      if (response?.data) {
        // Transform products to flat structure
        const transformedProducts = response.data.map(transformProduct);
        setProducts(transformedProducts);
        setTotalProducts(response.meta?.pagination?.total || 0);
        setTotalPages(response.meta?.pagination?.pageCount || 1);
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Không thể tải danh sách sản phẩm. Vui lòng thử lại.";
      addToast({
        id: Date.now().toString(),
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (toast: ToastProps) => {
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        onClose: () => removeToast(toast.id),
      },
    ]);
  };

  // Handle add inventory
  const handleAddInventoryClick = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setAddQuantity("");
    setAddInventoryDialogOpen(true);
  };

  const handleAddInventory = async () => {
    if (!selectedProduct || !token) {
      return;
    }

    const quantity = parseInt(addQuantity.trim());
    if (isNaN(quantity) || quantity <= 0) {
      addToast({
        id: Date.now().toString(),
        title: "Lỗi",
        description: "Vui lòng nhập số lượng hợp lệ (lớn hơn 0)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingInventory(true);

      // Calculate new inventory
      const currentInventory = selectedProduct.inventory ?? 0;
      const newInventory = currentInventory + quantity;

      // Update product inventory
      const response = await strapiClient(
        `/api/products/${selectedProduct.id}`,
        {
          method: "PUT",
          token,
          requiresAuth: true,
          body: JSON.stringify({
            data: {
              inventory: newInventory,
            },
          }),
        }
      );

      if (response) {
        addToast({
          id: Date.now().toString(),
          title: "Thành công",
          description: `Đã thêm ${quantity.toLocaleString("vi-VN")} sản phẩm vào kho. Tồn kho mới: ${newInventory.toLocaleString("vi-VN")}`,
          variant: "default",
        });

        // Refresh products list
        await fetchProducts();

        // Close dialog
        setAddInventoryDialogOpen(false);
        setSelectedProduct(null);
        setAddQuantity("");
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Không thể thêm hàng vào kho. Vui lòng thử lại.";
      addToast({
        id: Date.now().toString(),
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAddingInventory(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: totalProducts,
    inStock: products.filter((p) => (p.inventory ?? 0) > 0).length,
    lowStock: products.filter((p) => {
      const inv = p.inventory ?? 0;
      return inv > 0 && inv < 10;
    }).length,
    outOfStock: products.filter((p) => (p.inventory ?? 0) === 0).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kho hàng</h1>
          <p className="text-muted-foreground mt-1">
            Danh sách sản phẩm và số lượng tồn kho
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setProductForm({
              title: "",
              sku: "",
              price: "",
              inventory: "",
              productType: "",
              teaType: "",
              ingredient: "",
              finished_goods: "",
              description: "",
              imageFile: null,
              imagePreview: "",
              attributeWeight: "",
              attributeOrigin: "",
              attributeBrand: "",
              attributePackage: "",
              attributeExpiry: "",
            });
            setSelectedProduct(null);
            setProductDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Còn hàng</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.inStock}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sắp hết</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hết hàng</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.outOfStock}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Đang tải...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {debouncedSearch ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Tên sản phẩm</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-right p-4 font-medium">Giá</th>
                    <th className="text-right p-4 font-medium">Tồn kho</th>
                    <th className="text-center p-4 font-medium">Trạng thái</th>
                    <th className="text-left p-4 font-medium">Cập nhật</th>
                    <th className="text-center p-4 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const status = getInventoryStatus(product.inventory);
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium">{product.title || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Hash className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {product.sku || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatPrice(product.price)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold">
                            {product.inventory !== undefined && product.inventory !== null
                              ? product.inventory.toLocaleString("vi-VN")
                              : "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <Badge variant={status.variant} className="gap-1.5">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {product.updatedAt
                            ? new Date(product.updatedAt).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddInventoryClick(product)}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Thêm hàng
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setIsEditMode(true);
                                setSelectedProduct(product);
                                
                                // Fetch full product data with all fields
                                try {
                                  const response = await strapiClient<any>(
                                    `/api/products/${product.id}`,
                                    {
                                      method: "GET",
                                      token,
                                      requiresAuth: true,
                                    }
                                  );

                                  // Handle Strapi response structure: { data: {...} } or direct {...}
                                  const fullProduct = response?.data || response;

                                  // Check if structure is flat (Strapi v5) or nested (Strapi v4)
                                  const isFlat = !fullProduct?.attributes || 'title' in fullProduct;

                                  // Extract image URL if available for preview
                                  let imagePreview = "";
                                  const images = isFlat ? fullProduct?.images : (fullProduct?.attributes as any)?.images;
                                  if (images) {
                                    const baseUrl =
                                      process.env.NEXT_PUBLIC_STRAPI_URL ||
                                      process.env.NEXT_PUBLIC_API_URL ||
                                      "http://192.168.31.187:1337";

                                    if (typeof images === "object" && "url" in images) {
                                      const imageData = images as any;
                                      imagePreview = imageData.url?.startsWith("/")
                                        ? `${baseUrl}${imageData.url}`
                                        : imageData.url || "";
                                    } else if (Array.isArray(images) && images.length > 0) {
                                      const imageData = images[0] as any;
                                      imagePreview = imageData.url?.startsWith("/")
                                        ? `${baseUrl}${imageData.url}`
                                        : imageData.url || "";
                                    }
                                  }

                                  // Extract description from blocks if available
                                  let descriptionText = "";
                                  const description = isFlat ? fullProduct?.description : (fullProduct?.attributes as any)?.description;
                                  if (description) {
                                    try {
                                      // Helper function to extract text from Strapi blocks format
                                      const extractBlockText = (blocks: any): string => {
                                        if (!blocks) return "";
                                        if (typeof blocks === 'string') return blocks;
                                        
                                        // Handle Strapi blocks format
                                        if (Array.isArray(blocks)) {
                                          return blocks.map((block: any) => {
                                            // Handle paragraph blocks
                                            if (block.type === 'paragraph' && block.children) {
                                              return block.children.map((child: any) => {
                                                if (typeof child === 'string') return child;
                                                if (child.text) return child.text;
                                                if (child.children) {
                                                  return child.children.map((c: any) => c.text || '').join('');
                                                }
                                                return '';
                                              }).join('');
                                            }
                                            
                                            // Handle heading blocks
                                            if (block.type && block.type.startsWith('heading') && block.children) {
                                              return block.children.map((child: any) => child.text || '').join('') + '\n';
                                            }
                                            
                                            // Handle list blocks
                                            if (block.type === 'list' && block.children) {
                                              return block.children.map((item: any) => {
                                                if (item.children) {
                                                  return item.children.map((c: any) => c.text || '').join('');
                                                }
                                                return '';
                                              }).join('\n');
                                            }
                                            
                                            // Handle quote blocks
                                            if (block.type === 'quote' && block.children) {
                                              return block.children.map((child: any) => child.text || '').join('');
                                            }
                                            
                                            // Fallback: try to extract any text property
                                            if (block.body) return block.body;
                                            if (block.quote) return block.quote;
                                            if (block.text) {
                                              if (Array.isArray(block.text)) {
                                                return block.text.map((t: any) => {
                                                  if (t.children && Array.isArray(t.children)) {
                                                    return t.children.map((c: any) => c.text || '').join('');
                                                  }
                                                  return t.text || '';
                                                }).join('');
                                              }
                                              return block.text;
                                            }
                                            
                                            return '';
                                          }).filter(Boolean).join('\n').trim();
                                        }
                                        
                                        return "";
                                      };
                                      descriptionText = extractBlockText(description);
                                    } catch (e) {
                                      // Ignore parse errors
                                    }
                                  }

                                  // Extract attributes if available - handle both flat and nested structures
                                  let attributeWeight = "";
                                  let attributeOrigin = "";
                                  let attributeBrand = "";
                                  let attributePackage = "";
                                  let attributeExpiry = "";
                                  
                                  // Try to get attributes from both possible locations
                                  let attributes = isFlat ? fullProduct?.attributes : (fullProduct?.attributes as any)?.attributes;
                                  
                                  // If not found, try the other location
                                  if (!attributes && isFlat && fullProduct?.attributes) {
                                    // Already tried flat, no need to try again
                                  } else if (!attributes && !isFlat && fullProduct?.attributes?.attributes) {
                                    attributes = fullProduct.attributes.attributes;
                                  }
                                  
                                  if (attributes) {
                                    try {
                                      const attrs = typeof attributes === 'string' 
                                        ? JSON.parse(attributes)
                                        : attributes;
                                      if (typeof attrs === 'object' && attrs !== null) {
                                        attributeWeight = attrs.weight || "";
                                        attributeOrigin = attrs.origin || "";
                                        attributeBrand = attrs.brand || "";
                                        attributePackage = attrs.package || "";
                                        attributeExpiry = attrs.expiry || "";
                                      }
                                    } catch (e) {
                                      // Ignore parse errors
                                    }
                                  }

                                  // Map enum values - handle both flat and nested structures
                                  const productType = isFlat 
                                    ? (fullProduct?.productType || "")
                                    : ((fullProduct?.attributes as any)?.productType || "");
                                  
                                  const teaType = isFlat
                                    ? (fullProduct?.teaType || "")
                                    : ((fullProduct?.attributes as any)?.teaType || "");
                                  
                                  const ingredient = isFlat
                                    ? (fullProduct?.ingredient || "")
                                    : ((fullProduct?.attributes as any)?.ingredient || "");
                                  
                                  const finishedGoods = isFlat
                                    ? (fullProduct?.finished_goods || "")
                                    : ((fullProduct?.attributes as any)?.finished_goods || "");

                                  // Extract other fields with structure check
                                  const title = isFlat 
                                    ? (fullProduct?.title || product.title || "")
                                    : ((fullProduct?.attributes as any)?.title || product.title || "");
                                  
                                  const sku = isFlat
                                    ? (fullProduct?.sku || product.sku || "")
                                    : ((fullProduct?.attributes as any)?.sku || product.sku || "");
                                  
                                  const price = isFlat
                                    ? (fullProduct?.price || product.price)
                                    : ((fullProduct?.attributes as any)?.price || product.price);
                                  
                                  const inventory = isFlat
                                    ? (fullProduct?.inventory || product.inventory)
                                    : ((fullProduct?.attributes as any)?.inventory || product.inventory);

                                  const formData = {
                                    title: title,
                                    sku: sku || "",
                                    price: price?.toString() || "",
                                    inventory: inventory?.toString() || "",
                                    productType: productType,
                                    teaType: teaType,
                                    ingredient: ingredient,
                                    finished_goods: finishedGoods,
                                    description: descriptionText,
                                    imageFile: null,
                                    imagePreview: imagePreview,
                                    attributeWeight: attributeWeight,
                                    attributeOrigin: attributeOrigin,
                                    attributeBrand: attributeBrand,
                                    attributePackage: attributePackage,
                                    attributeExpiry: attributeExpiry,
                                  };

                                  setProductForm(formData);
                                } catch (error) {
                                  // Fallback to basic product data
                                  setProductForm({
                                    title: product.title || "",
                                    sku: product.sku || "",
                                    price: product.price?.toString() || "",
                                    inventory: product.inventory?.toString() || "",
                                    productType: "",
                                    teaType: "",
                                    ingredient: "",
                                    finished_goods: "",
                                    description: "",
                                    imageFile: null,
                                    imagePreview: "",
                                    attributeWeight: "",
                                    attributeOrigin: "",
                                    attributeBrand: "",
                                    attributePackage: "",
                                    attributeExpiry: "",
                                  });
                                }
                                
                                setProductDialogOpen(true);
                              }}
                              className="gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Sửa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalProducts)} trong tổng số{" "}
                  {totalProducts} sản phẩm
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Trước
                  </Button>
                  <div className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog 
        open={productDialogOpen} 
        onOpenChange={(open) => {
          // Prevent closing dialog when uploading or saving
          if (!open && (isUploadingImage || isSavingProduct)) {
            return;
          }
          setProductDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit className="h-5 w-5 text-primary" />
                  Sửa sản phẩm
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-primary" />
                  Thêm sản phẩm mới
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Cập nhật thông tin sản phẩm"
                : "Điền thông tin để tạo sản phẩm mới"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 relative">
            {/* Loading overlay when uploading image */}
            {isUploadingImage && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Đang upload ảnh...</p>
                  <p className="text-xs text-muted-foreground text-center">Vui lòng đợi, không đóng cửa sổ này</p>
                </div>
              </div>
            )}
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tên sản phẩm *</Label>
              <Input
                id="title"
                placeholder="Nhập tên sản phẩm..."
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                disabled={isSavingProduct || isUploadingImage}
                required
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Nhập SKU..."
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                disabled={isSavingProduct || isUploadingImage}
              />
            </div>

            {/* Price and Inventory */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  disabled={isSavingProduct || isUploadingImage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory">Tồn kho</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={productForm.inventory}
                  onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
                  disabled={isSavingProduct || isUploadingImage}
                />
              </div>
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label htmlFor="productType">Loại sản phẩm</Label>
              <Select
                value={productForm.productType ? productForm.productType : undefined}
                onValueChange={(value) => setProductForm({ ...productForm, productType: value })}
                disabled={isSavingProduct || isUploadingImage}
              >
                <SelectTrigger id="productType">
                  <SelectValue placeholder="Chọn loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tea">Trà</SelectItem>
                  <SelectItem value="tea_tools">Trà cụ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tea Type (only show if productType is tea) */}
            {productForm.productType === "tea" && (
              <div className="space-y-2">
                <Label htmlFor="teaType">Loại trà</Label>
                <Select
                  value={productForm.teaType ? productForm.teaType : undefined}
                  onValueChange={(value) => setProductForm({ ...productForm, teaType: value })}
                  disabled={isSavingProduct || isUploadingImage}
                >
                  <SelectTrigger id="teaType">
                    <SelectValue placeholder="Chọn loại trà" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">Bạch</SelectItem>
                    <SelectItem value="green">Lục</SelectItem>
                    <SelectItem value="yellow">Hoàng</SelectItem>
                    <SelectItem value="pink">Hồng</SelectItem>
                    <SelectItem value="black">Hắc</SelectItem>
                    <SelectItem value="scent">Hàm Hương</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Ingredient */}
            <div className="space-y-2">
              <Label htmlFor="ingredient">Thành phần</Label>
              <Select
                value={productForm.ingredient ? productForm.ingredient : undefined}
                onValueChange={(value) => setProductForm({ ...productForm, ingredient: value })}
                disabled={isSavingProduct || isUploadingImage}
              >
                <SelectTrigger id="ingredient">
                  <SelectValue placeholder="Chọn thành phần" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shan_tuyet">Shan Tuyết</SelectItem>
                  <SelectItem value="trung_du">Trung Du</SelectItem>
                  <SelectItem value="o_long">Ô Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Finished Goods */}
            <div className="space-y-2">
              <Label htmlFor="finished_goods">Thành phẩm</Label>
              <Select
                value={productForm.finished_goods ? productForm.finished_goods : undefined}
                onValueChange={(value) => setProductForm({ ...productForm, finished_goods: value })}
                disabled={isSavingProduct || isUploadingImage}
              >
                <SelectTrigger id="finished_goods">
                  <SelectValue placeholder="Chọn thành phẩm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diep_tra">Diệp trà</SelectItem>
                  <SelectItem value="doan_tra">Đoàn trà</SelectItem>
                  <SelectItem value="mat_tra">Mạt trà</SelectItem>
                  <SelectItem value="vien_tra">Viên trà</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả sản phẩm..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                disabled={isSavingProduct || isUploadingImage}
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="imageFile">Hình ảnh sản phẩm</Label>
              <div className="flex flex-col gap-4">
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file type
                      if (!file.type.startsWith('image/')) {
                        addToast({
                          id: Date.now().toString(),
                          title: "Lỗi",
                          description: "File phải là hình ảnh (jpg, png, gif, webp, etc.)",
                          variant: "destructive",
                        });
                        e.target.value = ""; // Clear file input
                        return;
                      }

                      // Validate file size (max 10MB)
                      const maxSize = 10 * 1024 * 1024; // 10MB
                      if (file.size > maxSize) {
                        addToast({
                          id: Date.now().toString(),
                          title: "Lỗi",
                          description: "Kích thước file không được vượt quá 10MB",
                          variant: "destructive",
                        });
                        e.target.value = ""; // Clear file input
                        return;
                      }

                      setProductForm({ ...productForm, imageFile: file });
                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProductForm((prev) => ({ ...prev, imagePreview: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  disabled={isSavingProduct || isUploadingImage}
                />
                {productForm.imagePreview && (
                  <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                    <img
                      src={productForm.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload hình ảnh sản phẩm. Ảnh sẽ được lưu vào /products/image/[SKU-ID]
              </p>
            </div>

            {/* Attributes - Separate Fields */}
            <div className="space-y-4">
              <Label>Thuộc tính sản phẩm</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attributeWeight" className="text-sm">Trọng lượng</Label>
                  <Input
                    id="attributeWeight"
                    placeholder="100g, 500g..."
                    value={productForm.attributeWeight}
                    onChange={(e) => setProductForm({ ...productForm, attributeWeight: e.target.value })}
                    disabled={isSavingProduct || isUploadingImage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attributeOrigin" className="text-sm">Xuất xứ</Label>
                  <Input
                    id="attributeOrigin"
                    placeholder="Vietnam, China..."
                    value={productForm.attributeOrigin}
                    onChange={(e) => setProductForm({ ...productForm, attributeOrigin: e.target.value })}
                    disabled={isSavingProduct || isUploadingImage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attributeBrand" className="text-sm">Thương hiệu</Label>
                  <Input
                    id="attributeBrand"
                    placeholder="Viet Tea..."
                    value={productForm.attributeBrand}
                    onChange={(e) => setProductForm({ ...productForm, attributeBrand: e.target.value })}
                    disabled={isSavingProduct || isUploadingImage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attributePackage" className="text-sm">Đóng gói</Label>
                  <Input
                    id="attributePackage"
                    placeholder="Túi, Hộp..."
                    value={productForm.attributePackage}
                    onChange={(e) => setProductForm({ ...productForm, attributePackage: e.target.value })}
                    disabled={isSavingProduct || isUploadingImage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attributeExpiry" className="text-sm">Hạn sử dụng</Label>
                  <Input
                    id="attributeExpiry"
                    placeholder="24 tháng, 36 tháng..."
                    value={productForm.attributeExpiry}
                    onChange={(e) => setProductForm({ ...productForm, attributeExpiry: e.target.value })}
                    disabled={isSavingProduct || isUploadingImage}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProductDialogOpen(false);
                setSelectedProduct(null);
                setIsEditMode(false);
                setProductForm({
                  title: "",
                  sku: "",
                  price: "",
                  inventory: "",
                  productType: "",
                  teaType: "",
                  ingredient: "",
                  finished_goods: "",
                  description: "",
                  imageFile: null,
                  imagePreview: "",
                  attributeWeight: "",
                  attributeOrigin: "",
                  attributeBrand: "",
                  attributePackage: "",
                  attributeExpiry: "",
                });
              }}
              disabled={isSavingProduct || isUploadingImage}
            >
              Hủy
            </Button>
            <Button
              onClick={async () => {
                if (!token) {
                  return;
                }

                if (!productForm.title.trim()) {
                  addToast({
                    id: Date.now().toString(),
                    title: "Lỗi",
                    description: "Vui lòng nhập tên sản phẩm",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  setIsSavingProduct(true);

                  const productData: any = {
                    title: productForm.title.trim(),
                  };

                  if (productForm.sku.trim()) {
                    productData.sku = productForm.sku.trim();
                  }
                  if (productForm.price.trim()) {
                    productData.price = parseFloat(productForm.price);
                  }
                  if (productForm.inventory.trim()) {
                    productData.inventory = parseInt(productForm.inventory);
                  }
                  if (productForm.productType) {
                    productData.productType = productForm.productType;
                  }
                  if (productForm.teaType) {
                    productData.teaType = productForm.teaType;
                  }
                  if (productForm.ingredient) {
                    productData.ingredient = productForm.ingredient;
                  }
                  if (productForm.finished_goods) {
                    productData.finished_goods = productForm.finished_goods;
                  }
                  
                  // Convert description text to Strapi blocks format
                  if (productForm.description.trim()) {
                    // Convert plain text to Strapi blocks format
                    const textLines = productForm.description.trim().split('\n').filter(line => line.trim());
                    if (textLines.length > 0) {
                      productData.description = textLines.map((line, index) => ({
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            text: line.trim(),
                          },
                        ],
                      }));
                    }
                  }

                  // Build attributes object from form fields
                  const attributes: any = {};
                  if (productForm.attributeWeight.trim()) {
                    attributes.weight = productForm.attributeWeight.trim();
                  }
                  if (productForm.attributeOrigin.trim()) {
                    attributes.origin = productForm.attributeOrigin.trim();
                  }
                  if (productForm.attributeBrand.trim()) {
                    attributes.brand = productForm.attributeBrand.trim();
                  }
                  if (productForm.attributePackage.trim()) {
                    attributes.package = productForm.attributePackage.trim();
                  }
                  if (productForm.attributeExpiry.trim()) {
                    attributes.expiry = productForm.attributeExpiry.trim();
                  }
                  
                  // Only add attributes if at least one field is filled
                  if (Object.keys(attributes).length > 0) {
                    productData.attributes = attributes;
                  }

                  // Upload image to Strapi media library if provided
                  if (productForm.imageFile) {
                    setIsUploadingImage(true);
                    try {
                      // Validate file type again before upload
                      if (!productForm.imageFile.type.startsWith('image/')) {
                        throw new Error("File phải là hình ảnh");
                      }

                      const uploadFormData = new FormData();
                      // Append file with proper name - Strapi expects 'files' field
                      uploadFormData.append("files", productForm.imageFile, productForm.imageFile.name);
                      if (productForm.sku.trim()) {
                        uploadFormData.append("sku", productForm.sku.trim());
                      }

                      const apiUrl =
                        process.env.NEXT_PUBLIC_STRAPI_URL ||
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://192.168.31.187:1337";
                      const uploadResponse = await fetch(
                        `${apiUrl}/api/products/upload-image`,
                        {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            // Don't set Content-Type header, let browser set it with boundary
                          },
                          body: uploadFormData,
                        }
                      );

                      if (!uploadResponse.ok) {
                        const errorText = await uploadResponse.text();
                        let errorMessage = "Failed to upload image";
                        try {
                          const errorJson = JSON.parse(errorText);
                          errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
                        } catch {
                          errorMessage = errorText || errorMessage;
                        }
                        throw new Error(errorMessage);
                      }

                      const uploadResult = await uploadResponse.json();
                      if (uploadResult?.data?.id) {
                        // Assign the uploaded file ID to product images
                        productData.images = uploadResult.data.id;
                      } else {
                        throw new Error("No file ID returned from upload");
                      }
                    } catch (uploadError: any) {
                      addToast({
                        id: Date.now().toString(),
                        title: "Cảnh báo",
                        description: `Upload ảnh thất bại: ${uploadError.message}. Tiếp tục lưu sản phẩm...`,
                        variant: "default",
                      });
                    } finally {
                      setIsUploadingImage(false);
                    }
                  }

                  if (isEditMode && selectedProduct) {
                    // Update product
                    await strapiClient(
                      `/api/products/${selectedProduct.id}`,
                      {
                        method: "PUT",
                        token,
                        requiresAuth: true,
                        body: JSON.stringify({
                          data: productData,
                        }),
                      }
                    );

                    addToast({
                      id: Date.now().toString(),
                      title: "Thành công",
                      description: "Đã cập nhật sản phẩm thành công",
                      variant: "default",
                    });
                  } else {
                    // Create product
                    await strapiClient(
                      `/api/products`,
                      {
                        method: "POST",
                        token,
                        requiresAuth: true,
                        body: JSON.stringify({
                          data: productData,
                        }),
                      }
                    );

                    addToast({
                      id: Date.now().toString(),
                      title: "Thành công",
                      description: "Đã tạo sản phẩm mới thành công",
                      variant: "default",
                    });
                  }

                  // Refresh products list
                  await fetchProducts();

                  // Close dialog
                  setProductDialogOpen(false);
                  setSelectedProduct(null);
                  setIsEditMode(false);
                  setProductForm({
                    title: "",
                    sku: "",
                    price: "",
                    inventory: "",
                    productType: "",
                    teaType: "",
                    ingredient: "",
                    finished_goods: "",
                    description: "",
                    imageFile: null,
                    imagePreview: "",
                    attributeWeight: "",
                    attributeOrigin: "",
                    attributeBrand: "",
                    attributePackage: "",
                    attributeExpiry: "",
                  });
                } catch (error: any) {
                  const errorMessage =
                    error?.message || "Không thể lưu sản phẩm. Vui lòng thử lại.";
                  addToast({
                    id: Date.now().toString(),
                    title: "Lỗi",
                    description: errorMessage,
                    variant: "destructive",
                  });
                } finally {
                  setIsSavingProduct(false);
                }
              }}
              disabled={isSavingProduct || isUploadingImage || !productForm.title.trim()}
            >
              {isSavingProduct || isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? "Đang upload ảnh..." : "Đang lưu..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Cập nhật" : "Tạo sản phẩm"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Dialog */}
      <Dialog open={addInventoryDialogOpen} onOpenChange={setAddInventoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Thêm hàng vào kho
            </DialogTitle>
            <DialogDescription>
              Thêm số lượng hàng vào kho cho sản phẩm: {selectedProduct?.title || "N/A"}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              {/* Product Info */}
              <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">SKU:</span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {selectedProduct.sku || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Tồn kho hiện tại:</span>
                  <span className="font-semibold text-foreground">
                    {(selectedProduct.inventory ?? 0).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Add Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Số lượng cần thêm</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min="1"
                  placeholder="Nhập số lượng..."
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(e.target.value)}
                  disabled={isAddingInventory}
                />
                <p className="text-xs text-muted-foreground">
                  Số lượng sau khi thêm:{" "}
                  <span className="font-semibold">
                    {((selectedProduct.inventory ?? 0) + (parseInt(addQuantity) || 0)).toLocaleString("vi-VN")}
                  </span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddInventoryDialogOpen(false);
                setSelectedProduct(null);
                setAddQuantity("");
              }}
              disabled={isAddingInventory}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddInventory}
              disabled={isAddingInventory || !addQuantity.trim() || parseInt(addQuantity.trim()) <= 0}
            >
              {isAddingInventory ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Xác nhận
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
