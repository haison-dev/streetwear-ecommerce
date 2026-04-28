import { create } from "zustand";

type AdminTab = "products" | "orders" | "categories" | "brands" | "inventory" | "users" | "collections";

interface AdminDashboardState {
  activeTab: AdminTab;
  productPage: number;
  orderPage: number;
  categoryPage: number;
  brandPage: number;
  inventoryPage: number;
  pageSize: number;
  setActiveTab: (tab: AdminTab) => void;
  setProductPage: (page: number) => void;
  setOrderPage: (page: number) => void;
  setCategoryPage: (page: number) => void;
  setBrandPage: (page: number) => void;
  setInventoryPage: (page: number) => void;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  activeTab: "products",
  productPage: 1,
  orderPage: 1,
  categoryPage: 1,
  brandPage: 1,
  inventoryPage: 1,
  pageSize: 10,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setProductPage: (productPage) => set({ productPage }),
  setOrderPage: (orderPage) => set({ orderPage }),
  setCategoryPage: (categoryPage) => set({ categoryPage }),
  setBrandPage: (brandPage) => set({ brandPage }),
  setInventoryPage: (inventoryPage) => set({ inventoryPage }),
}));

