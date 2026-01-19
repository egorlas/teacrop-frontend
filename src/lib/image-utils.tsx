"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";

/**
 * Get fallback product image URL from env
 */
function getFallbackImageUrl(): string | undefined {
  const fallback = process.env.NEXT_PUBLIC_FALLBACK_PRODUCT_IMAGE;
  return fallback || undefined;
}

/**
 * Product Image component with error handling and fallback
 */
type ProductImageProps = Omit<ImageProps, 'onError'> & {
  fallbackSrc?: string;
};

export function ProductImage({ 
  src, 
  fallbackSrc, 
  alt, 
  ...props 
}: ProductImageProps) {
  const fallbackUrl = fallbackSrc || getFallbackImageUrl();
  const [imgSrc, setImgSrc] = useState<string>(
    typeof src === 'string' ? src : (src as any)?.src || ''
  );
  const [hasError, setHasError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackUrl) {
      // Try fallback image
      setHasError(true);
      setImgSrc(fallbackUrl);
    } else {
      // No fallback available or fallback also failed, show placeholder
      setShowPlaceholder(true);
    }
  };

  // If show placeholder, return placeholder UI
  if (showPlaceholder || (!imgSrc && !fallbackUrl)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <span className="text-4xl">🍃</span>
      </div>
    );
  }

  // If has error but trying fallback, keep showing image (it will handle error again if needed)
  // Otherwise show the image
  return (
    <Image
      src={imgSrc || fallbackUrl || ''}
      alt={alt || 'Product image'}
      onError={handleError}
      {...props}
    />
  );
}

