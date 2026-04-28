import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import { adminService } from "@/services/adminService";
import type { AdminStatus, OrderStatus } from "@/types";

export const useAdminProductsQuery = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: queryKeys.adminProducts(params),
    queryFn: () => adminService.listProducts(params),
  });

export const useAdminOrdersQuery = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: queryKeys.adminOrders(params),
    queryFn: () => adminService.listOrders(params),
  });

export const useAdminCategoriesQuery = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: queryKeys.adminCategories(params),
    queryFn: () => adminService.listCategories(params),
  });

export const useAdminBrandsQuery = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: queryKeys.adminBrands(params),
    queryFn: () => adminService.listBrands(params),
  });

export const useAdminInventoryQuery = (params: { page: number; limit: number }) =>
  useQuery({
    queryKey: queryKeys.adminInventory(params),
    queryFn: () => adminService.listInventory(params),
  });

export const useAdminUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => adminService.listUsers(),
  });

export const useAdminRolesQuery = () =>
  useQuery({
    queryKey: queryKeys.adminRoles,
    queryFn: () => adminService.listRoles(),
  });

export const useAdminPermissionsQuery = () =>
  useQuery({
    queryKey: queryKeys.adminPermissions,
    queryFn: () => adminService.listPermissions(),
  });

export const useAdminCollectionsQuery = () =>
  useQuery({
    queryKey: queryKeys.adminCollections,
    queryFn: () => adminService.listCollections(),
  });

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: () => {
      toast.success("Created product");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useUpdateProductStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, status }: { productId: string; status: AdminStatus }) =>
      adminService.updateProduct(productId, { status }),
    onSuccess: () => {
      toast.success("Updated product status");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, payload }: { productId: string; payload: Record<string, unknown> }) =>
      adminService.updateProduct(productId, payload),
    onSuccess: () => {
      toast.success("Updated product");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => adminService.deleteProduct(productId),
    onSuccess: () => {
      toast.success("Deleted product");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: () => {
      toast.success("Created category");
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
};

export const useUpdateCategoryStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, status }: { categoryId: string; status: AdminStatus }) =>
      adminService.updateCategory(categoryId, { status }),
    onSuccess: () => {
      toast.success("Updated category status");
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
};

export const useCreateBrandMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createBrand,
    onSuccess: () => {
      toast.success("Created brand");
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
    },
  });
};

export const useUpdateBrandStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ brandId, status }: { brandId: string; status: AdminStatus }) =>
      adminService.updateBrand(brandId, { status }),
    onSuccess: () => {
      toast.success("Updated brand status");
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
    },
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      adminService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Updated order status");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};

export const useUpdateUserRolesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      adminService.updateUserRoles(userId, roleIds),
    onSuccess: () => {
      toast.success("Updated user roles");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
    },
  });
};

export const useUpdateInventoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      available,
      reserved,
      sold,
    }: {
      variantId: string;
      available: number;
      reserved: number;
      sold: number;
    }) => adminService.updateInventory(variantId, { available, reserved, sold }),
    onSuccess: () => {
      toast.success("Updated inventory");
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
};

export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminService.createRole,
    onSuccess: () => {
      toast.success("Created role");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRoles });
    },
  });
};

export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: { name?: string; permissionIds?: string[] } }) =>
      adminService.updateRole(roleId, payload),
    onSuccess: () => {
      toast.success("Updated role permissions");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminRoles });
    },
  });
};
