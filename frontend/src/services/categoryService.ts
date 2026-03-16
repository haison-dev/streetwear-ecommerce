import api from "@/lib/axios";
import type { Category } from "@/types";

export interface CategoryPayload {
  name: string;
  slug?: string;
  image?: string;
  parentId?: string;
  status?: "active" | "inactive";
}

export const categoryService = {
  list: async (): Promise<Category[]> => {
    const res = await api.get("/categories");
    return res.data.categories || [];
  },

  create: async (payload: CategoryPayload): Promise<Category> => {
    const res = await api.post("/categories", payload);
    return res.data.category;
  },

  update: async (id: string, payload: Partial<CategoryPayload>): Promise<Category> => {
    const res = await api.patch(`/categories/${id}`, payload);
    return res.data.category;
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("images", file);

    const res = await api.post("/uploads/category-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const firstImage = res.data?.images?.[0];
    if (!firstImage?.url) {
      throw new Error("Category image upload failed");
    }

    return firstImage.url;
  },
};
