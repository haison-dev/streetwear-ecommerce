import api from "@/lib/axios";
import type { Brand } from "@/types";

export const brandService = {
  list: async (): Promise<Brand[]> => {
    const res = await api.get("/brands");
    return res.data.brands || [];
  },
};
