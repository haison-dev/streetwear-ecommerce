import { create } from "zustand";

interface WishlistStoreState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export const useWishlistStore = create<WishlistStoreState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}));

