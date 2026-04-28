import { create } from "zustand";

interface CartStoreState {
  isOpen: boolean;
  isSyncing: boolean;
  setOpen: (open: boolean) => void;
  setSyncing: (syncing: boolean) => void;
}

export const useCartStore = create<CartStoreState>((set) => ({
  isOpen: false,
  isSyncing: false,
  setOpen: (open) => set({ isOpen: open }),
  setSyncing: (isSyncing) => set({ isSyncing }),
}));

