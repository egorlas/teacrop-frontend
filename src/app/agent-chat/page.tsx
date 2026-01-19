"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { AppShell } from "@/components/app/AppShell";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { QuickReplies } from "@/components/chat/QuickReplies";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MiniCart } from "@/components/cart/MiniCart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/useChatStore";
import { toast, Toaster } from "sonner";
import type { Message } from "@/types/chat";
import { registerServiceWorker } from "@/lib/pwa";
import { t } from "@/lib/i18n";
import { buildIndex, matchProductsInText } from "@/lib/product-match";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/product";

const QUICK_REPLIES = [
  { text: "Chọn hương vị" },
  { text: "Tư vấn quà tặng" },
  { text: "Xem sản phẩm trong tầm 300k" },
  { text: "Tính phí ship Hà Nội" },
];

export default function AgentChatPage() {
  const {
    messages,
    addMessage,
    updateMessage,
    sessionId,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch products from backend
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getProducts({ populate: '*' });
        console.log('fetchedProducts', response)
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to empty array on error
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Build product index once products are loaded (memoized)
  const productIndex = useMemo(() => buildIndex(products), [products]);

  // Register PWA service worker
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Check if user is near bottom (< 200px) to enable auto-scroll
  const checkNearBottom = () => {
    const container = scrollAreaRef.current;
    if (!container) return false;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User is near bottom if within 200px
    return distanceFromBottom < 200;
  };

  // Track scroll position to detect user scrolling up
  useEffect(() => {
    const container = scrollAreaRef.current;
    if (!container) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      
      // If user scrolled up significantly, disable auto-scroll
      if (currentScrollTop < lastScrollTopRef.current - 10) {
        shouldAutoScrollRef.current = checkNearBottom();
      } else if (currentScrollTop > lastScrollTopRef.current) {
        // Scrolling down - check if near bottom
        shouldAutoScrollRef.current = checkNearBottom();
      }

      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto scroll with throttling and near-bottom check
  const scrollToBottom = (behavior: ScrollBehavior = "smooth", immediate = false) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const scrollFn = () => {
      if (messagesEndRef.current && shouldAutoScrollRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
      }
    };

    if (immediate) {
      // Use requestAnimationFrame for smoother scrolling during streaming
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollFn);
      });
    } else {
      // Throttle to 50ms for non-streaming updates
      scrollTimeoutRef.current = setTimeout(scrollFn, 50);
    }
  };

  // Auto scroll when messages change (new message added or updated)
  useEffect(() => {
    // Check if we should auto-scroll (user is near bottom)
    const shouldScroll = checkNearBottom();
    if (shouldScroll) {
      shouldAutoScrollRef.current = true;
      // Small delay to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    }
  }, [messages.length, messages]);

  // Auto scroll during streaming (when message content updates)
  useEffect(() => {
    if (isLoading) {
      // During streaming, check if near bottom and enable auto-scroll
      const isNearBottom = checkNearBottom();
      if (isNearBottom) {
        shouldAutoScrollRef.current = true;
        // Use immediate scroll for real-time updates during streaming
        scrollToBottom("smooth", true);
      }
    }
  }, [messages, isLoading]); // Re-run when messages content changes during streaming

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      type: "text",
      content,
      createdAt: Date.now(),
    };

    addMessage(userMessage);
    setIsLoading(true);
    // Enable auto-scroll when sending new message
    shouldAutoScrollRef.current = true;
    scrollToBottom("smooth");

    try {
      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call backend API with streaming
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.31.187:1337';
      const response = await fetch(`${apiUrl}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Create assistant message ID early
      const assistantMessageId = `msg-${Date.now()}-assistant`;

      // Add placeholder assistant message
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        type: "text",
        content: "",
        createdAt: Date.now(),
      };
      addMessage(assistantMessage);

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk and append
        const chunk = decoder.decode(value, { stream: true });

        // Check for errors in chunk
        if (chunk.includes("ERROR:")) {
          const errorMsg = chunk.replace("ERROR:", "").trim();
          throw new Error(errorMsg);
        }

        // Append content and update message
        if (chunk && chunk.trim()) {
          fullContent += chunk;
          // Update the message in real-time
          updateMessage(assistantMessageId, {
            content: fullContent,
          });
          
          // Auto-scroll during streaming - check if near bottom first
          if (shouldAutoScrollRef.current || checkNearBottom()) {
            shouldAutoScrollRef.current = true;
            // Use immediate scroll with requestAnimationFrame for smooth streaming
            scrollToBottom("smooth", true);
          }
        }
      }

      // Finalize message
      if (fullContent.trim()) {
        const finalContent = fullContent.trim();
        
        // Match products in assistant's response (client-side detection)
        const matchedProducts = matchProductsInText(finalContent, productIndex);

        // Update message with content and matched products
        updateMessage(assistantMessageId, {
          content: finalContent,
          ...(matchedProducts.length > 0 && {
            type: "product_card" as const,
            products: matchedProducts,
          }),
        });

        // Show toast if products were matched
        if (matchedProducts.length > 0) {
          const productNames = matchedProducts.map((p) => p.name).join(", ");
          toast.success(`Đã phát hiện ${matchedProducts.length} sản phẩm: ${productNames}`, {
            duration: 3000,
          });
        }
      } else {
        // Remove empty message
        // Note: You might want to add a removeMessage action to the store
      }

      setIsLoading(false);
      // Final scroll after streaming completes - ensure we're at bottom
      shouldAutoScrollRef.current = true;
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi";
      toast.error(t("common.error", "Đã xảy ra lỗi"), {
        description: errorMessage,
      });
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  return (
    <>
      <AppShell rightPane={<MiniCart />}>
        <div className="flex h-full flex-col overflow-hidden bg-background">
          {/* Messages Area - Mobile: full-bleed with padding, Desktop: centered container */}
          <ScrollArea 
            className="flex-1 overflow-y-auto" 
            ref={scrollAreaRef}
          >
            {/* Mobile: px-3 or px-4, Desktop: centered container */}
            <div className="mx-auto flex w-full max-w-none flex-col gap-4 px-3 py-4 sm:max-w-3xl sm:px-4 lg:max-w-4xl">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h1 className="mb-2 text-2xl font-semibold text-foreground">
                    {t("chat.welcome", "Chào mừng đến với cửa hàng của chúng tôi")}
                  </h1>
                  <p className="mb-4 text-muted-foreground">
                    {t("chat.placeholder", "Hãy bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn bên dưới")}
                  </p>
                  <QuickReplies replies={QUICK_REPLIES} onSelect={handleQuickReply} />
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {/* Show typing indicator when waiting for first chunk */}
              {isLoading && (() => {
                const lastMessage = messages[messages.length - 1];
                // Show typing indicator if loading and:
                // - No last message, or
                // - Last message is not assistant, or
                // - Last message is assistant but has no content yet
                return !lastMessage || lastMessage.role !== "assistant" || !lastMessage.content?.trim();
              })() && <TypingIndicator />}

              {/* Spacer for sticky input + safe-area on mobile */}
              <div className="h-4 sm:h-0" />
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Replies (show when no messages or after last assistant message) */}
          {/* Mobile: hidden, Desktop: show below messages */}
          {messages.length > 0 && !isLoading && (
            <div className="hidden border-t border-border bg-muted/30 px-4 py-3 sm:block">
              <QuickReplies replies={QUICK_REPLIES} onSelect={handleQuickReply} />
            </div>
          )}

          {/* Input Area - Sticky bottom on mobile */}
          <MessageInput
            onSend={handleSendMessage}
            disabled={isLoading}
            placeholder={t("chat.placeholder", "Nhập tin nhắn...")}
          />
        </div>
      </AppShell>
      <Toaster position="top-right" />
    </>
  );
}
