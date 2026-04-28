import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { wishlistService } from "@/services/wishlistService";

export const useWishlistQuery = () =>
  useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: wishlistService.getWishlist,
  });

export const useAddWishlistItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.addItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });
};

export const useRemoveWishlistItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
    },
  });
};

