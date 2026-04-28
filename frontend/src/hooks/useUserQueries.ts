import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { userService } from "@/services/userService";

export const useMeQuery = () =>
  useQuery({
    queryKey: queryKeys.authMe,
    queryFn: userService.getMe,
  });

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authMe });
    },
  });
};

export const useUpdateMyPasswordMutation = () =>
  useMutation({
    mutationFn: userService.updateMyPassword,
  });

