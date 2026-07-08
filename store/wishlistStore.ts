import { create } from "zustand";

interface WishlistStore {
  productIds: Set<string>;
  loaded:     boolean;
  setIds:     (ids: string[]) => void;
  add:        (id: string) => void;
  remove:     (id: string) => void;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  productIds: new Set(),
  loaded:     false,

  setIds: (ids) => set({ productIds: new Set(ids), loaded: true }),

  add: (id) =>
    set((state) => ({ productIds: new Set(state.productIds).add(id) })),

  remove: (id) =>
    set((state) => {
      const next = new Set(state.productIds);
      next.delete(id);
      return { productIds: next };
    }),
}));
