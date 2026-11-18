import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { wishlistService } from "@/services/wishlistService";
import { useAuthStore } from "@/stores/useAuthStore";

export const useWishlistQuery = () => {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: [...queryKeys.wishlist, userId],
    queryFn: wishlistService.getWishlist,
    enabled: Boolean(userId),
  });
};

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

