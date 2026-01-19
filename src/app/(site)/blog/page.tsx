import { Suspense } from "react";
import { Container } from "@/components/Container";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CategoryTabs } from "@/components/blog/CategoryTabs";
import { getBlogPosts } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import type { BlogPost, BlogCategory } from "@/types/blog";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Khám phá các bài viết về trà Việt Nam, văn hóa trà, và nhiều hơn nữa",
});

type BlogPageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
};

async function BlogList({ searchParams }: BlogPageProps) {
  const page = Number(searchParams.page) || 1;
  const categorySlug = searchParams.category || null;

  // Fetch blog posts
  const response = await getBlogPosts({
    populate: '*',
    pagination: {
      page,
      pageSize: 12,
    },
    filters: categorySlug
      ? {
          'category.slug': categorySlug,
        }
      : undefined,
    sort: ['publishedAt:desc', 'createdAt:desc'],
  });

  const posts = response.data;
  const pagination = response.meta.pagination;

  // Extract unique categories from all posts
  const categoriesMap = new Map<string, BlogCategory>();
  posts.forEach((post) => {
    if (post.category && !categoriesMap.has(post.category.id)) {
      categoriesMap.set(post.category.id, post.category);
    }
  });
  const categories = Array.from(categoriesMap.values());

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <CategoryTabs categories={categories} activeCategory={categorySlug} />

      {/* Blog Posts Grid */}
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <div className="flex items-center justify-center gap-4">
              {pagination.page > 1 && (
                <a
                  href={`/blog?page=${pagination.page - 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
                >
                  Trước
                </a>
              )}
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.pageCount}
              </span>
              {pagination.page < pagination.pageCount && (
                <a
                  href={`/blog?page=${pagination.page + 1}${categorySlug ? `&category=${categorySlug}` : ''}`}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
                >
                  Sau
                </a>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {categorySlug ? 'Không tìm thấy bài viết nào trong danh mục này.' : 'Chưa có bài viết nào.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default async function BlogPage(props: BlogPageProps) {
  const searchParams = await props.searchParams;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Khám phá các bài viết về trà Việt Nam, văn hóa trà, và nhiều hơn nữa
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          }
        >
          <BlogList searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}

