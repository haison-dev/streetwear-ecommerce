import api from "@/lib/axios";

export const paymentService = {
  getById: async (paymentId: string) => {
    const res = await api.get(`/payments/${paymentId}`);
    return res.data;
  },
  createAttempt: async (
    paymentId: string,
    payload: { provider: "momo" | "vnpay" },
  ) => {
    const res = await api.post(`/payments/${paymentId}/attempts`, payload);
    return res.data;
  },
  createVnpayCheckout: async (paymentId: string, payload?: { bankCode?: string; locale?: string }) => {
    const res = await api.post(`/payments/${paymentId}/vnpay/checkout`, payload || {});
    return res.data;
  },
  listTransactions: async (
    paymentId: string,
    params?: { page?: number; limit?: number },
  ) => {
    const res = await api.get(`/payments/${paymentId}/transactions`, { params });
    return res.data;
  },
};

