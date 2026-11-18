import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { orderService, type CreateOrderPayload, type ListOrdersParams } from "@/services/orderService";
import { useAuthStore } from "@/stores/useAuthStore";

export const useOrdersQuery = (params?: ListOrdersParams) => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...queryKeys.orders(params || {}), user?.id],
    queryFn: () => orderService.list(params),
    enabled: Boolean(user),
  });
};

export const useOrderDetailQuery = (orderId?: string) => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...queryKeys.orderDetail(orderId || ""), user?.id],
    queryFn: () => orderService.getById(orderId!),
    enabled: Boolean(orderId && user),
  });
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createFromCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};

