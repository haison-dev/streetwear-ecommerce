import api from "@/lib/axios";
import type { Review } from "@/types";

export interface ListProductReviewsParams {
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface ReviewPayload {
  productId: string;
  rating: number;
  comment?: string;
}

export const reviewService = {
  listProductReviews: async (
    productId: string,
    params?: ListProductReviewsParams,
  ): Promise<{ reviews: Review[]; meta: { page: number; limit: number; total: number } }> => {
    const res = await api.get(`/products/${productId}/reviews`, { params });
    return res.data;
  },
  createReview: async (payload: ReviewPayload) => {
    const res = await api.post("/reviews", payload);
    return res.data;
  },
};
