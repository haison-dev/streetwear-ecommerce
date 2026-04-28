import api from "@/lib/axios";
import type {
  AuthResponse,
  MeResponse,
  RefreshResponse,
  RegisterPayload,
} from "@/types/auth";

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  refresh: async (): Promise<RefreshResponse> => {
    const res = await api.post("/auth/refresh");
    return res.data;
  },

  me: async (): Promise<MeResponse> => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

