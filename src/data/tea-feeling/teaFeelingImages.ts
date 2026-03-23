/**
 * Pool ảnh minh họa trà (Unsplash) — gán theo ô trong mock; CMS có thể thay từng bản ghi.
 * Kích thước query phù hợp Next/Image.
 */
export const TEA_FEELING_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=900&q=80",
  "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=900&q=80",
  "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=900&q=80",
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900&q=80",
  "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=900&q=80",
  "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=900&q=80",
  "https://images.unsplash.com/photo-1597318131403-41f5286fa260?w=900&q=80",
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=900&q=80",
  "https://images.unsplash.com/photo-1499636136210-6f4ee9155836?w=900&q=80",
  "https://images.unsplash.com/photo-1558160074-4d73d2f3d52e?w=900&q=80",
  "https://images.unsplash.com/photo-1582793988951-9c02d9cb0d5b?w=900&q=80",
  "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=900&q=80",
] as const;

export function teaFeelingImageAt(linearIndex: number): string {
  return TEA_FEELING_IMAGE_POOL[linearIndex % TEA_FEELING_IMAGE_POOL.length]!;
}
