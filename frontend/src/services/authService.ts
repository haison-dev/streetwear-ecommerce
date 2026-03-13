import api from "@/lib/axios";

export const authService = {
  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
  ) => {
    const res = await api.post("/auth/register", {
      email,
      password,
      firstName,
      lastName,
      phone,
    });
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh");
    return res.data.accessToken;
  },

  me: async () => { 
    const res = await api.get("/auth/me");
    return res.data;
  },
};
