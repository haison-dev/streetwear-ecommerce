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
}

export interface ListOrdersParams {
  status?: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest" | "totalPrice" | "totalPrice:desc";
}

export const orderService = {
  createFromCart: async (payload: CreateOrderPayload) => {
    const res = await api.post("/orders", payload);
    return res.data;
  },
  list: async (params?: ListOrdersParams) => {
    const res = await api.get("/orders", { params });
    return res.data;
  },
  getById: async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },
};

