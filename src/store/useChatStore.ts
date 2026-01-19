import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, CartItem } from "@/types/chat";

type ChatState = {
  messages: Message[];
  cart: CartItem[];
  sessionId: string;
  customerName: string;
  customerPhone?: string;
  rememberPreferences: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
  addToCart: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  updateCartItem: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  setSessionId: (sessionId: string) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone?: string) => void;
  setRememberPreferences: (remember: boolean) => void;
  
  resetChat: () => void;
};

const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      cart: [],
      sessionId: generateSessionId(),
      customerName: "",
      customerPhone: undefined,
      rememberPreferences: true,

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg,
          ),
        })),

      clearMessages: () =>
        set({ messages: [] }),

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((c) => c.productId === item.productId);
          if (existingItem) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId
                  ? { ...c, qty: c.qty + (item.qty || 1) }
                  : c,
              ),
            };
          }
          return {
            cart: [...state.cart, { ...item, qty: item.qty || 1 }],
          };
        }),

      updateCartItem: (productId, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((c) => c.productId !== productId)
              : state.cart.map((c) =>
                  c.productId === productId ? { ...c, qty } : c,
                ),
        })),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.productId !== productId),
        })),

      clearCart: () =>
        set({ cart: [] }),

      setSessionId: (sessionId) =>
        set({ sessionId }),

      setCustomerName: (name) =>
        set({ customerName: name }),

      setCustomerPhone: (phone) =>
        set({ customerPhone: phone }),

      setRememberPreferences: (remember) =>
        set({ rememberPreferences: remember }),

      resetChat: () =>
        set({
          messages: [],
          cart: [],
          sessionId: generateSessionId(),
        }),
    }),
    {
      name: "viettea-chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        cart: state.cart,
        sessionId: state.sessionId,
        customerName: state.rememberPreferences ? state.customerName : "",
        customerPhone: state.rememberPreferences ? state.customerPhone : undefined,
        rememberPreferences: state.rememberPreferences,
      }),
    },
  ),
);

