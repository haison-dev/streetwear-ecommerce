import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { reviewService, type ListProductReviewsParams, type ReviewPayload } from "@/services/reviewService";

export const useProductReviewsQuery = (
  productId?: string,
  params?: ListProductReviewsParams,
) =>
  useQuery({
    queryKey: queryKeys.productReviews(productId || "", params || {}),
    queryFn: () => reviewService.listProductReviews(productId!, params),
    enabled: Boolean(productId),
  });

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewPayload) => reviewService.createReview(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.productReviews(variables.productId, {}),
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["products"], exact: false });
    },
  });
};
