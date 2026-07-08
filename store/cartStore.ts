import { create } from "zustand";

export interface CartItem {
  id:         string;    // local key: {slug}-{size}
  apiId?:     string;    // DB cart item UUID (needed for PATCH/DELETE)
  slug:       string;
  name:       string;
  price:      string;
  salePrice?: string;
  size:       string;
  quantity:   number;
  image?:     string;
  stock?:     number;    // variant stock — used to cap quantity in UI
}

interface CartStore {
  items:          CartItem[];
  isOpen:         boolean;
  openCart:       () => void;
  closeCart:      () => void;
  addItem:        (item: Omit<CartItem, "id">) => void;
  removeItem:     (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart:      () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items:  [],
  isOpen: false,

  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (item) =>
    set((state) => {
      const id       = `${item.slug}-${item.size}`;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: i.quantity + item.quantity, apiId: item.apiId ?? i.apiId }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, id }] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity < 1) {
        return { items: state.items.filter((i) => i.id !== id) };
      }
      return {
        items: state.items.map((i) => {
          if (i.id !== id) return i;
          const capped = i.stock !== undefined ? Math.min(quantity, i.stock) : quantity;
          return { ...i, quantity: capped };
        }),
      };
    }),

  clearCart: () => set({ items: [] }),
}));
