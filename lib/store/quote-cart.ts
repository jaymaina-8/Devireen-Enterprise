import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number; // retail price
  wholesalePrice?: number | null; // wholesale price if available
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
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
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
        const pricingModel: 'RETAIL' | 'WHOLESALE' = state.wholesaleMode
          ? 'WHOLESALE'
          : 'RETAIL';

        const itemCount = state.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );

        const rawSubtotal = state.items.reduce((acc, item) => {
          // Use wholesale price if wholesaleMode is active AND wholesale price exists
          const effectivePrice =
            state.wholesaleMode && item.wholesalePrice != null
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
      partialize: (state) => ({
        items: state.items,
        wholesaleMode: state.wholesaleMode,
      }),
    }
  )
);
