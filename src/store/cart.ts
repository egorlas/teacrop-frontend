import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number; // VND
  image?: string;
  variant?: string;
  qty: number;
};

export type PaymentMethod = "qr" | "cash";

export type Transaction = {
  id: string;
  userId?: string;
  amount: number;
  method: PaymentMethod;
  createdAt: string; // ISO
  items: Array<Pick<CartItem, "id" | "title" | "qty" | "price" | "variant">>;
};

type CartState = {
  items: CartItem[];
  lastTransaction: Transaction | null;

  // Actions
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  updateItemQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  createTransaction: (method: PaymentMethod, userId?: string, transactionId?: string) => Promise<Transaction>;
};

const generateTransactionId = () => `txn-${Date.now()}-${Math.random().toString(36).substring(7)}`;

/**
 * Cart Store with Persistence
 * 
 * IMPORTANT: This store is persisted independently from auth store.
 * Cart items are stored in localStorage with key "viettea-cart-storage"
 * and will NOT be lost when user logs in or registers.
 * 
 * Cart is only cleared when:
 * 1. User successfully completes an order (createTransaction)
 * 2. User manually removes items or clears cart
 * 
 * Login/Register/Logout actions do NOT affect cart state.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      lastTransaction: null,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, qty: item.qty || 1 }],
          };
        }),

      updateItemQty: (id, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearCart: () =>
        set({
          items: [],
        }),

              createTransaction: async (method, userId, transactionId) => {
                const { items } = get();
                if (items.length === 0) {
                  throw new Error("Cart is empty");
                }

                const amount = items.reduce((sum, item) => sum + item.price * item.qty, 0);
                const transaction: Transaction = {
                  id: transactionId || generateTransactionId(),
                  userId,
                  amount,
                  method,
                  createdAt: new Date().toISOString(),
                  items: items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    qty: item.qty,
                    price: item.price,
                    variant: item.variant,
                  })),
                };

                // Simulate API call for QR payment (already handled in API for cash)
                if (method !== "cash") {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                set({
                  lastTransaction: transaction,
                  items: [], // Clear cart after successful transaction
                });

                return transaction;
              },
    }),
    {
      name: "viettea-cart-storage",
      partialize: (state) => ({
        items: state.items,
        lastTransaction: state.lastTransaction,
      }),
    },
  ),
);

