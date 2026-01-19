"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyVND } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import { ProductImage } from "@/lib/image-utils";

type ProductCardProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  variant?: string;
};

export function ProductCard({ productId, name, price, image, description, variant }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: productId,
      title: name,
      price,
      image,
      variant,
      qty: 1,
    });
    toast.success(t("cart.item_added", "Đã thêm vào giỏ"), {
      description: name, // Show product name in toast
      duration: 2000,
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <ProductImage
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-base sm:text-lg">{name}</CardTitle>
        {description && (
          <CardDescription className="line-clamp-2 text-xs sm:text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold text-primary sm:text-2xl">{formatCurrencyVND(price)}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddToCart} className="w-full" size="default" variant="default">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t("product.add_to_cart", "Thêm vào giỏ")}
        </Button>
      </CardFooter>
    </Card>
  );
}

