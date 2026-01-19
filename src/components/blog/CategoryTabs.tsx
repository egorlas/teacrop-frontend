"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types/blog";

type CategoryTabsProps = {
  categories: BlogCategory[];
  activeCategory?: string | null;
};

export function CategoryTabs({ categories, activeCategory }: CategoryTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    params.set('page', '1'); // Reset to first page
    router.push(`${pathname}?${params.toString()}`);
  };

  const isActive = (categorySlug: string | null) => {
    if (!categorySlug) return !activeCategory;
    return activeCategory === categorySlug;
  };

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-4">
      <button
        onClick={() => handleCategoryChange(null)}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
          isActive(null)
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80",
        )}
      >
        Tất cả
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isActive(category.slug)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

