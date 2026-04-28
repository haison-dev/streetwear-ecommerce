import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { orderService, type CreateOrderPayload, type ListOrdersParams } from "@/services/orderService";

export const useOrdersQuery = (params?: ListOrdersParams) =>
  useQuery({
    queryKey: queryKeys.orders(params || {}),
    queryFn: () => orderService.list(params),
  });

export const useOrderDetailQuery = (orderId?: string) =>
  useQuery({
    queryKey: queryKeys.orderDetail(orderId || ""),
    queryFn: () => orderService.getById(orderId!),
    enabled: Boolean(orderId),
  });

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createFromCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders({}), exact: false });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
};

