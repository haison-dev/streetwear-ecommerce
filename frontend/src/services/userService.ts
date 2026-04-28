import api from "@/lib/axios";

export const userService = {
  getMe: async () => {
    const res = await api.get("/users/me");
    return res.data;
  },
  updateMe: async (payload: { firstName: string; lastName: string; phone?: string }) => {
    const res = await api.patch("/users/me", payload);
    return res.data;
  },
  updateMyPassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await api.put("/users/me/password", payload);
    return res.data;
  },
};

