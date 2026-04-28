import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { paymentService } from "@/services/paymentService";

export const usePaymentByIdQuery = (paymentId?: string) =>
  useQuery({
    queryKey: queryKeys.payment(paymentId || ""),
    queryFn: () => paymentService.getById(paymentId!),
    enabled: Boolean(paymentId),
  });

export const usePaymentTransactionsQuery = (
  paymentId?: string,
  params?: { page?: number; limit?: number },
) =>
  useQuery({
    queryKey: queryKeys.paymentTransactions(paymentId || "", params || {}),
    queryFn: () => paymentService.listTransactions(paymentId!, params),
    enabled: Boolean(paymentId),
  });

export const useCreatePaymentAttemptMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      provider,
    }: {
      paymentId: string;
      provider: "momo" | "vnpay";
    }) => paymentService.createAttempt(paymentId, { provider }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payment(variables.paymentId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTransactions(variables.paymentId, {}),
        exact: false,
      });
    },
  });
};

export const useCreateVnpayCheckoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      bankCode,
      locale,
    }: {
      paymentId: string;
      bankCode?: string;
      locale?: string;
    }) => paymentService.createVnpayCheckout(paymentId, { bankCode, locale }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payment(variables.paymentId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.paymentTransactions(variables.paymentId, {}),
        exact: false,
      });
    },
  });
};

