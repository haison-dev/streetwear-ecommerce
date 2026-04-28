import api from "@/lib/axios";
import type { Brand } from "@/types";

export interface ListBrandsParams {
  status?: "active" | "inactive" | "all";
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const brandService = {
  list: async (params?: ListBrandsParams): Promise<Brand[]> => {
    const res = await api.get("/brands", { params });
    return res.data.brands || [];
  },
};
