"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/cart/ProductCard";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { toast } from "sonner";
import { t } from "@/lib/i18n";
import Image from "next/image";

type MessageBubbleProps = {
  message: Message;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatarText = isUser ? "Bạn" : "AI";
  const initials = getInitials(avatarText);
  const messageType = message.type || "text";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success(t("common.copied", "Đã sao chép"));
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (messageType) {
      case "product_card": {
        // Support both old meta format and new products array
        const products = message.products || [];
        const meta = message.meta || {};

        // If products array exists, render grid of product cards
        if (products.length > 0) {
          return (
            <div className="w-full max-w-2xl">
              {/* Show text content if exists */}
              {message.content && (
                <div className="mb-4">
                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  ) : (
                    <MarkdownContent content={message.content} className="text-foreground" />
                  )}
                </div>
              )}
              {/* Grid of product cards - Mobile: 1 col, Desktop: 2 cols */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    description={product.note || product.description}
                  />
                ))}
              </div>
            </div>
          );
        }

        // Fallback: old meta format (backward compatibility)
        const productId = (meta.productId as string) || "";
        const name = (meta.name as string) || "";
        const price = (meta.price as number) || 0;
        const image = meta.image as string | undefined;
        const description = (meta.description as string) || undefined;

        if (productId && name && price) {
          return (
            <div className="max-w-sm">
              {message.content && (
                <p className="mb-3 whitespace-pre-wrap break-words text-sm">{message.content}</p>
              )}
              <ProductCard
                productId={productId}
                name={name}
                price={price}
                image={image}
                description={description}
              />
            </div>
          );
        }

        return null;
      }

      case "order_summary": {
        const meta = message.meta || {};
        const items = (meta.items as Array<{ productId: string; name: string; price: number; qty: number }>) || [];
        const total = (meta.total as number) || 0;

        return (
          <div className="max-w-sm">
            {message.content && (
              <p className="mb-3 whitespace-pre-wrap break-words text-sm">{message.content}</p>
            )}
            <OrderSummary items={items} total={total} />
          </div>
        );
      }

      default:
        // Render markdown for assistant messages, plain text for user messages
        if (isUser) {
          return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
        }
        return <MarkdownContent content={message.content} className="text-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold bg-primary text-primary-foreground",
          )}
        >
          {initials}
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border border-border overflow-hidden">
          <Image
            src="/logo-viettea.svg"
            alt="Viettea AI"
            width={40}
            height={40}
            className="object-contain p-1.5"
            priority={false}
          />
        </div>
      )}

      {/* Message Content - Mobile: max-w-[85%], Desktop: max-w-[70%] */}
      {/* product_card can expand wider on desktop */}
      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]",
          messageType === "product_card" && "sm:max-w-full",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "group relative break-words overflow-wrap-anywhere rounded-2xl px-3 py-2 text-sm leading-relaxed sm:px-4 sm:py-2.5",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            messageType !== "text" && messageType !== "product_card" && "bg-card border border-border shadow-sm",
            messageType === "product_card" && "bg-transparent border-0 p-0 shadow-none",
          )}
        >
          {renderContent()}
          {/* Copy Button */}
          {messageType === "text" && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleCopy}
              aria-label={t("common.copy", "Sao chép")}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
          {messageType === "text" && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
              onClick={handleCopy}
              aria-label={t("common.copy", "Sao chép")}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

