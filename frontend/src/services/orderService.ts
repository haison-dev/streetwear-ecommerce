import api from "@/lib/axios";

export interface OrderShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

export interface CreateOrderPayload {
  shippingAddress: OrderShippingAddress;
  paymentMethod: "cod" | "momo" | "vnpay";
  note?: string;
  couponCode?: string;
  expectedTotal?: number;
}

export interface OrderQuote {
  itemsPrice: number;
  shippingFee: number;
  discount: number;
  totalPrice: number;
}

export interface CustomerOrder {
  _id: string;
  orderNumber?: string;
  createdAt?: string;
  items: { productId: string; variantId: string; name: string; image?: string; size?: string; color?: string; quantity: number; price: number }[];
  shippingAddress: OrderShippingAddress;
  status: NonNullable<ListOrdersParams["status"]>;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  shippingFee: number;
  discount: number;
  note?: string;
}

export interface ListOrdersParams {
  status?: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "totalPrice" | "totalPrice:desc";
  scope?: "mine" | "operations";
}

export interface OrderListItem extends CustomerOrder {
  paymentId?: string | null;
  nextStatuses?: CustomerOrder["status"][];
}

export const orderService = {
  quote: async (city: string, couponCode: string): Promise<OrderQuote> => {
    const res = await api.post("/orders/quote", { city, couponCode });
    return res.data;
  },
  createFromCart: async (payload: CreateOrderPayload) => {
    const res = await api.post("/orders", payload);
    return res.data;
  },
  list: async (params?: ListOrdersParams): Promise<{ orders: OrderListItem[]; meta: { page: number; limit: number; total: number } }> => {
    const res = await api.get("/orders", { params: { scope: "mine", ...params } });
    return res.data;
  },
  getById: async (orderId: string): Promise<{ order: CustomerOrder }> => {
    const res = await api.get(`/orders/${orderId}`, { params: { scope: "mine" } });
    return res.data;
  },
  updateStatus: (orderId: string, status: CustomerOrder["status"]) => api.patch(`/orders/${orderId}/status`, { status }),
};

