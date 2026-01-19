import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { ProductImage } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  post: BlogPost;
  className?: string;
};

export function ArticleCard({ post, className }: ArticleCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-md",
        className,
      )}
    >
      {/* Cover Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {post.coverImage ? (
          <ProductImage
            src={post.coverImage || ''}
            alt={post.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-4xl">📝</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        {post.category && (
          <span className="mb-2 text-xs font-medium text-primary">
            {post.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {post.author && (
              <span>{post.author.username}</span>
            )}
            {post.readingTime && (
              <span>• {post.readingTime} min read</span>
            )}
          </div>
          {post.publishedAt && (
            <span>
              {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

