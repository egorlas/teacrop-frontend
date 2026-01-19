import type { Product } from "./product";

export type MessageRole = "user" | "assistant";

export type MessageType = "text" | "product_card" | "order_summary";

export type Message = {
  id: string;
  role: MessageRole;
  type?: MessageType; // Default: "text"
  content: string;
  products?: Product[]; // Matched products from text (for product_card type)
  meta?: Record<string, unknown>; // For product_card: { productId, name, price, image, description }, for order_summary: { items, total }
  createdAt: number; // Unix timestamp in milliseconds
};

export type ToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ToolResult = {
  toolCallId: string;
  name: string;
  result: unknown;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type OrderItem = CartItem & {
  subtotal: number;
};
