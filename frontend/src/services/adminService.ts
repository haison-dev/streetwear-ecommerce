import api from "@/lib/axios";
import type {
  AdminBrandListResponse,
  AdminCategoryListResponse,
  AdminCollectionListResponse,
  AdminInventoryListResponse,
  AdminListParams,
  AdminOrdersListResponse,
  AdminProductListResponse,
  AdminPermissionsListResponse,
  ProductStatus,
  AdminRolesListResponse,
  AdminStatus,
  AdminUsersListResponse,
  OrderStatus,
} from "@/types";

export const adminService = {
  listProducts: async (
    params?: AdminListParams,
  ): Promise<AdminProductListResponse> => {
    const res = await api.get("/products", {
      params: { ...(params || {}), status: "all" },
    });
    return res.data;
  },
  createProduct: async (payload: {
    name: string;
    brandId: string;
    categoryId: string;
    description?: string;
    images?: string[];
    price: number;
    salePrice?: number;
    status?: ProductStatus;
  }) => {
    const res = await api.post("/products", payload);
    return res.data;
  },
  updateProduct: async (
    id: string,
    payload: Partial<{
      name: string;
      brandId: string;
      categoryId: string;
      description: string;
      images: string[];
      price: number;
      salePrice: number;
      status: ProductStatus;
    }>,
  ) => {
    const res = await api.patch(`/products/${id}`, payload);
    return res.data;
  },
  uploadProductImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const res = await api.post("/uploads/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const images = Array.isArray(res.data?.images) ? res.data.images : [];
    const urls = images
      .map((item: { url?: string }) => item?.url)
      .filter((url: string | undefined): url is string => Boolean(url));

    if (!urls.length) {
      throw new Error("Product image upload failed");
    }

    return urls;
  },
  deleteProduct: async (id: string) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  listCategories: async (
    params?: AdminListParams,
  ): Promise<AdminCategoryListResponse> => {
    const res = await api.get("/categories", {
      params: { ...(params || {}), status: "all" },
    });
    return res.data;
  },
  createCategory: async (payload: {
    name: string;
    image?: string;
    parentId?: string;
    status?: AdminStatus;
  }) => {
    const res = await api.post("/categories", payload);
    return res.data;
  },
  updateCategory: async (
    id: string,
    payload: Partial<{
      name: string;
      image: string;
      parentId: string;
      status: AdminStatus;
    }>,
  ) => {
    const res = await api.patch(`/categories/${id}`, payload);
    return res.data;
  },

  listBrands: async (
    params?: AdminListParams,
  ): Promise<AdminBrandListResponse> => {
    const res = await api.get("/brands", {
      params: { ...(params || {}), status: "all" },
    });
    return res.data;
  },
  createBrand: async (payload: {
    name: string;
    logo?: string;
    status?: AdminStatus;
  }) => {
    const res = await api.post("/brands", payload);
    return res.data;
  },
  updateBrand: async (
    id: string,
    payload: Partial<{
      name: string;
      logo: string;
      status: AdminStatus;
    }>,
  ) => {
    const res = await api.patch(`/brands/${id}`, payload);
    return res.data;
  },

  listOrders: async (
    params?: AdminListParams & { status?: OrderStatus; userId?: string },
  ) => {
    const res = await api.get("/orders", { params });
    return res.data as AdminOrdersListResponse;
  },
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const res = await api.patch(`/orders/${orderId}/status`, { status });
    return res.data;
  },

  listUsers: async (): Promise<AdminUsersListResponse> => {
    const res = await api.get("/admin/users");
    return res.data;
  },
  updateUserRoles: async (userId: string, roleIds: string[]) => {
    const res = await api.patch(`/admin/users/${userId}/roles`, { roleIds });
    return res.data;
  },

  listRoles: async (): Promise<AdminRolesListResponse> => {
    const res = await api.get("/admin/roles");
    return res.data;
  },
  listPermissions: async (): Promise<AdminPermissionsListResponse> => {
    const res = await api.get("/admin/permissions");
    return res.data;
  },
  createRole: async (payload: { name: string; permissionIds?: string[] }) => {
    const res = await api.post("/admin/roles", payload);
    return res.data;
  },
  updateRole: async (
    roleId: string,
    payload: { name?: string; permissionIds?: string[] },
  ) => {
    const res = await api.patch(`/admin/roles/${roleId}`, payload);
    return res.data;
  },

  listInventory: async (params?: {
    page?: number;
    limit?: number;
    variantId?: string;
  }) => {
    const res = await api.get("/admin/inventory", { params });
    return res.data as AdminInventoryListResponse;
  },
  updateInventory: async (
    variantId: string,
    payload: { available?: number; reserved?: number; sold?: number },
  ) => {
    const res = await api.patch(`/admin/inventory/${variantId}`, payload);
    return res.data;
  },

  listCollections: async (): Promise<AdminCollectionListResponse> => {
    const res = await api.get("/collections", {
      params: { status: "all", limit: 100 },
    });
    return res.data;
  },
};
