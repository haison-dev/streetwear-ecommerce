import api from "@/lib/axios";

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  invalidItems: number;
}

export interface CartItem {
  _id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isAvailable: boolean;
  availableStock: number;
  product: { name?: string; images?: string[]; slug?: string } | null;
  variant: { size?: string; color?: string } | null;
}

export interface CartResponse {
  items: CartItem[];
  summary: CartSummary;
}

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const res = await api.get("/cart");
    return res.data;
  },
  addItem: async (payload: {
    productId: string;
    variantId: string;
    quantity: number;
  }) => {
    const res = await api.post("/cart/items", payload);
    return res.data;
  },
  updateItem: async (cartItemId: string, quantity: number) => {
    const res = await api.patch(`/cart/items/${cartItemId}`, { quantity });
    return res.data;
  },
  removeItem: async (cartItemId: string) => {
    await api.delete(`/cart/items/${cartItemId}`);
  },
};

