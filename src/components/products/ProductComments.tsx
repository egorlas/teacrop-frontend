"use client";

import { useState } from "react";
import type { Comment } from "@/types/review";
import { ThumbsUp, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCommentsProps = {
  comments?: Comment[];
};

export function ProductComments({ comments }: ProductCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [repliedTo, setRepliedTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  if (!comments || comments.length === 0) {
    return (
      <section className="py-8">
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Bình luận</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="mb-4 text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <button
            type="button"
            className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Gửi bình luận
          </button>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleReply = (commentId: string) => {
    if (repliedTo === commentId) {
      setRepliedTo(null);
      setReplyContent("");
    } else {
      setRepliedTo(commentId);
      setReplyContent("");
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={cn("mb-4", isReply && "ml-6 border-l-2 border-border pl-4")}>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-card-foreground">{comment.userName}</h3>
          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">{comment.content}</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ThumbsUp className="h-3 w-3" aria-hidden="true" />
            {comment.likes || 0}
          </button>
          {!isReply && (
            <button
              type="button"
              onClick={() => handleReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Reply className="h-3 w-3" aria-hidden="true" />
              Trả lời
            </button>
          )}
        </div>
        {repliedTo === comment.id && (
          <div className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết phản hồi..."
              rows={3}
              className="mb-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // Handle reply submission
                  setRepliedTo(null);
                  setReplyContent("");
                }}
                className="rounded-lg bg-primary px-4 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Gửi
              </button>
              <button
                type="button"
                onClick={() => {
                  setRepliedTo(null);
                  setReplyContent("");
                }}
                className="rounded-lg border border-border bg-background px-4 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-semibold text-foreground">Bình luận</h2>

      {/* Form bình luận mới */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">Viết bình luận</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          rows={4}
          className="mb-4 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <button
          type="button"
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Gửi bình luận
        </button>
      </div>

      {/* Danh sách bình luận */}
      <div>{comments.map((comment) => renderComment(comment))}</div>
    </section>
  );
}

