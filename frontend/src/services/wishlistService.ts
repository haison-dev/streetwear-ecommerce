import api from "@/lib/axios";

export interface WishlistItem {
  productId: string | { _id: string; name?: string; slug?: string };
  variantId?: string;
}

export const wishlistService = {
  getWishlist: async (): Promise<{ items: WishlistItem[] }> => {
    const res = await api.get("/wishlist");
    return res.data;
  },
  addItem: async (productId: string) => {
    const res = await api.post("/wishlist/items", { productId });
    return res.data;
  },
  removeItem: async (productId: string) => {
    await api.delete(`/wishlist/items/${productId}`);
  },
};

