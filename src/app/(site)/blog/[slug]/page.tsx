import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { BlockRenderer } from "@/components/blog/BlockRenderer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { ProductImage } from "@/lib/image-utils";
import type { Metadata } from "next";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return buildMetadata({
      title: "Bài viết không tìm thấy",
      description: "Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.",
    });
  }

  const seo = post.seo;
  return buildMetadata({
    title: seo?.metaTitle || post.title,
    description: seo?.metaDescription || post.excerpt || post.title,
    image: post.coverImage || seo?.ogImage,
    url: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts (same category, exclude current post)
  const relatedPostsResponse = await getBlogPosts({
    populate: '*',
    pagination: { page: 1, pageSize: 3 },
    filters: post.category
      ? {
          'category.slug': post.category.slug,
        }
      : undefined,
    sort: ['publishedAt:desc'],
  });
  const relatedPosts = relatedPostsResponse.data
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <article className="py-16 sm:py-24">
      <Container>
        {/* Header */}
        <div className="mx-auto mb-8 max-w-3xl">
          {post.category && (
            <span className="mb-4 inline-block text-sm font-medium text-primary">
              {post.category.name}
            </span>
          )}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mb-6 text-xl text-muted-foreground">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
            {post.author && (
              <div className="flex items-center gap-2">
                <span>{post.author.username}</span>
              </div>
            )}
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {post.readingTime && (
              <span>• {post.readingTime} phút đọc</span>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mx-auto mb-12 max-w-4xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <ProductImage
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-3xl">
          {post.content && post.content.length > 0 ? (
            <BlockRenderer blocks={post.content} />
          ) : (
            <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mx-auto mt-16 max-w-6xl">
            <h2 className="mb-8 text-2xl font-bold text-foreground">
              Bài viết liên quan
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <ArticleCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </article>
  );
}

