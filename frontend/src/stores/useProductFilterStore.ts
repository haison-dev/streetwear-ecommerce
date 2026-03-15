import { create } from "zustand";

interface ProductFilterState {
  q: string;
  categoryId: string;
  brandId: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number;
  sort: string;
  page: number;
  limit: number;
  setFilters: (patch: Partial<ProductFilterState>) => void;
  reset: () => void;
}

const defaultState = {
  q: "",
  categoryId: "",
  brandId: "",
  minPrice: undefined,
  maxPrice: undefined,
  minRating: 0,
  sort: "newest",
  page: 1,
  limit: 8,
};

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  ...defaultState,
  setFilters: (patch) => set((state) => ({ ...state, ...patch })),
  reset: () => set({ ...defaultState }),
}));
