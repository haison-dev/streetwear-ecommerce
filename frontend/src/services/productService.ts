import api from "@/lib/axios";
import type { FiltersResponse, Product, ProductWithVariants } from "@/types";

export interface ListProductsParams {
  q?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export interface ListProductsResponse {
  products: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const productService = {
  list: async (params?: ListProductsParams): Promise<ListProductsResponse> => {
    const res = await api.get("/products", { params });
    return res.data;
  },

  getFilterStats: async (
    params?: Pick<ListProductsParams, "categoryId" | "brandId" | "q" | "status">,
  ): Promise<FiltersResponse> => {
    const res = await api.get("/products/filters", { params });
    return res.data;
  },

  getBySlug: async (slug: string): Promise<ProductWithVariants> => {
    const res = await api.get(`/products/slug/${slug}`);
    return res.data.product;
  },

  getById: async (id: string): Promise<ProductWithVariants> => {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  },
};