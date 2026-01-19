"use client";

import { useState } from "react";
import type { Review } from "@/types/review";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductReviewsProps = {
  reviews?: Review[];
};

export function ProductReviews({ reviews }: ProductReviewsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Đánh giá</h2>
        <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
      </section>
    );
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);
  const hasMore = reviews.length > 3;

  // Tính tổng điểm đánh giá
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-semibold text-foreground">Đánh giá</h2>

      {/* Tổng quan đánh giá */}
      <div className="mb-8 grid gap-6 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-2 text-4xl font-bold text-card-foreground">
            {averageRating.toFixed(1)}
          </div>
          <div className="mb-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted",
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Dựa trên {reviews.length} đánh giá
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating as keyof typeof ratingCounts];
            const percentage = (count / reviews.length) * 100;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="min-w-[60px] text-sm text-muted-foreground">{rating} sao</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="min-w-[40px] text-right text-sm text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danh sách đánh giá */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-semibold text-card-foreground">{review.userName}</h3>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      Đã mua
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="mb-2 font-medium text-card-foreground">{review.title}</p>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted",
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="rounded-lg border border-border bg-background px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {showAll ? "Thu gọn" : `Xem thêm ${reviews.length - 3} đánh giá`}
          </button>
        </div>
      )}
    </section>
  );
}

