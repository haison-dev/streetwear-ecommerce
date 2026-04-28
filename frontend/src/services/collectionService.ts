import api from "@/lib/axios";
import type { Collection, Product } from "@/types";

export interface ListCollectionsParams {
  status?: "active" | "inactive" | "all";
  q?: string;
  page?: number;
  limit?: number;
  sort?: "order" | "newest" | "oldest" | "name";
}

export const collectionService = {
  list: async (params?: ListCollectionsParams): Promise<Collection[]> => {
    const res = await api.get("/collections", { params });
    return res.data.collections || [];
  },
  getBySlug: async (slug: string): Promise<Collection> => {
    const res = await api.get(`/collections/slug/${slug}`);
    return res.data.collection;
  },
  listProductsBySlug: async (
    slug: string,
    params?: { page?: number; limit?: number; sort?: string },
  ): Promise<{
    collection: Collection;
    products: Product[];
    meta: { page: number; limit: number; total: number };
  }> => {
    const res = await api.get(`/collections/slug/${slug}/products`, { params });
    return res.data;
  },
};

