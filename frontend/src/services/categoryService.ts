import api from "@/lib/axios";
import type { Category } from "@/types";

export const categoryService = {
  list: async (): Promise<Category[]> => {
    const res = await api.get("/categories");
    return res.data.categories || [];
  },
};
