import type { BlogBlock } from "@/types/blog";
import { ProductImage } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

type BlockRendererProps = {
  blocks: BlogBlock[];
  className?: string;
};

export function BlockRenderer({ blocks, className }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }
  // Helper to safely extract text from nested structure
  const getBlockText = (block: any): string => {
    // Try simple format first (body/quote)
    if (block.body) return block.body;
    if (block.quote) return block.quote;
    
    // Try Strapi blocks format (text[0].children[0].text)
    if (block.text && Array.isArray(block.text) && block.text.length > 0) {
      const firstText = block.text[0];
      if (firstText.children && Array.isArray(firstText.children) && firstText.children.length > 0) {
        return firstText.children
          .map((child: any) => child.text || '')
          .join('')
          .trim();
      }
      if (firstText.text) {
        return firstText.text;
      }
    }
    
    return '';
  };

  return (
    <div className={cn("prose prose-lg dark:prose-invert max-w-none", className)}>
      {blocks.map((block, index) => {
        switch (block.__component) {
          case 'blocks.paragraph':
            const paragraphText = getBlockText(block);
            if (!paragraphText) return null;
            return (
              <div key={index} className="mb-6">
                <p className="leading-relaxed text-foreground whitespace-pre-wrap">
                  {paragraphText}
                </p>
              </div>
            );

          case 'blocks.image':
            // Extract image URL from nested structure
            const imageUrl = block.image?.url || 
              (block.image?.data?.attributes?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.187:1337'}${block.image.data.attributes.url}` : undefined) ||
              (block.image?.data?.url);
            const imageAlt = block.image?.alt || block.image?.data?.attributes?.alternativeText || 'Blog image';
            
            if (!imageUrl) return null;
            
            return (
              <div key={index} className="my-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <ProductImage
                    src={imageUrl || ''}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
                {block.caption && (
                  <p className="mt-2 text-center text-sm text-muted-foreground italic">
                    {block.caption}
                  </p>
                )}
              </div>
            );

          case 'blocks.quote':
            const quoteText = getBlockText(block);
            if (!quoteText) return null;
            return (
              <blockquote
                key={index}
                className="my-8 border-l-4 border-primary pl-6 italic text-foreground"
              >
                <p className="mb-2 text-lg">{quoteText}</p>
                {block.author && (
                  <footer className="text-sm text-muted-foreground">
                    — {block.author}
                  </footer>
                )}
              </blockquote>
            );

          case 'blocks.gallery':
            if (!block.images || block.images.length === 0) return null;
            
            return (
              <div key={index} className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {block.images.map((image: any, imgIndex: number) => {
                  const imgUrl = image.url || 
                    (image.data?.attributes?.url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.187:1337'}${image.data.attributes.url}` : undefined) ||
                    (image.data?.url);
                  const imgAlt = image.alt || image.data?.attributes?.alternativeText || `Gallery image ${imgIndex + 1}`;
                  
                  if (!imgUrl) return null;
                  
                  return (
                    <div
                      key={imgIndex}
                      className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted"
                    >
                      <ProductImage
                        src={imgUrl || ''}
                        alt={imgAlt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  );
                })}
              </div>
            );

          case 'blocks.embed':
            return (
              <div key={index} className="my-8">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <iframe
                    src={block.url}
                    className="h-full w-full"
                    allowFullScreen
                    title="Embedded content"
                  />
                </div>
                {block.caption && (
                  <p className="mt-2 text-center text-sm text-muted-foreground italic">
                    {block.caption}
                  </p>
                )}
              </div>
            );

          case 'blocks.cta':
            return (
              <div
                key={index}
                className="my-8 rounded-lg border border-primary bg-primary/10 p-6 text-center"
              >
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {block.title}
                </h3>
                {block.description && (
                  <p className="mb-4 text-muted-foreground">{block.description}</p>
                )}
                <a
                  href={block.link}
                  className="inline-block rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Xem thêm
                </a>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

