import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PricingMode } from '@/types/database.types';

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number; // retail price
  wholesalePrice?: number | null; // wholesale price if available
  wholesaleUnit?: string | null;
  pricingMode: PricingMode;
  imageUrl?: string | null;
  quantity: number;
}

interface CartSummary {
  subtotal: number;
  itemCount: number;
  vatAmount: number;
  total: number;
  pricingModel: 'RETAIL' | 'WHOLESALE';
}

interface QuoteCartState {
  items: CartItem[];
  isOpen: boolean;
  wholesaleMode: boolean;
  addItem: (
    item: Omit<CartItem, 'quantity' | 'pricingMode'> & {
      quantity?: number;
      pricingMode?: PricingMode;
    }
  ) => void;
  removeItem: (id: string, pricingMode?: PricingMode) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    pricingMode?: PricingMode
  ) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  toggleWholesaleMode: () => void;
  setWholesaleMode: (mode: boolean) => void;
  getSummary: () => CartSummary;
}

export const useQuoteCart = create<QuoteCartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      wholesaleMode: false,

      addItem: (item) =>
        set((state) => {
          const itemMode: PricingMode = item.pricingMode ?? 'RETAIL';
          const existingItem = state.items.find(
            (i) => i.id === item.id && (i.pricingMode ?? 'RETAIL') === itemMode
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && (i.pricingMode ?? 'RETAIL') === itemMode
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                pricingMode: itemMode,
                quantity: item.quantity || 1,
              },
            ],
          };
        }),

      removeItem: (id, pricingMode) =>
        set((state) => ({
          items: state.items.filter((i) =>
            pricingMode
              ? !(i.id === id && (i.pricingMode ?? 'RETAIL') === pricingMode)
              : i.id !== id
          ),
        })),

      updateQuantity: (id, quantity, pricingMode) =>
        set((state) => ({
          items: state.items.map((i) =>
            (
              pricingMode
                ? i.id === id && (i.pricingMode ?? 'RETAIL') === pricingMode
                : i.id === id
            )
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),

      clearCart: () => set({ items: [], wholesaleMode: false }),

      setIsOpen: (isOpen) => set({ isOpen }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      toggleWholesaleMode: () =>
        set((state) => ({ wholesaleMode: !state.wholesaleMode })),

      setWholesaleMode: (mode) => set({ wholesaleMode: mode }),

      getSummary: (): CartSummary => {
        const state = get();
        const allWholesale =
          state.items.length > 0 &&
          state.items.every((i) => (i.pricingMode ?? 'RETAIL') === 'WHOLESALE');
        const pricingModel: 'RETAIL' | 'WHOLESALE' = allWholesale
          ? 'WHOLESALE'
          : 'RETAIL';

        const itemCount = state.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );

        const rawSubtotal = state.items.reduce((acc, item) => {
          const effectivePrice =
            (item.pricingMode ?? 'RETAIL') === 'WHOLESALE' &&
            item.wholesalePrice != null
              ? item.wholesalePrice
              : item.price;
          return acc + effectivePrice * item.quantity;
        }, 0);

        // Round all monetary values to the nearest whole number (KSh)
        const subtotal = Math.round(rawSubtotal);
        const vatAmount = 0; // VAT is calculated in CheckoutPage.tsx if the user opts in
        const total = subtotal;

        return { itemCount, subtotal, vatAmount, total, pricingModel };
      },
    }),
    {
      name: 'devireen-quote-cart',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState?.items) {
          return {
            ...persistedState,
            items: persistedState.items.map((item: any) => ({
              ...item,
              pricingMode: item.pricingMode ?? 'RETAIL',
            })),
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          pricingMode: item.pricingMode ?? 'RETAIL',
        })),
        wholesaleMode: state.wholesaleMode,
      }),
    }
  )
);
