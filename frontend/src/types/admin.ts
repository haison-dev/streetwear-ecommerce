import type { Brand, Category, Collection, Product } from "@/types";

export type AdminStatus = "active" | "inactive";
export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";

export interface AdminListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  q?: string;
  sort?: string;
}

export interface AdminProductListResponse {
  products: Product[];
  meta: AdminListMeta;
}

export interface AdminCategoryListResponse {
  categories: Category[];
  meta: AdminListMeta;
}

export interface AdminBrandListResponse {
  brands: Brand[];
  meta: AdminListMeta;
}

export interface AdminCollectionListResponse {
  collections: Collection[];
  meta: AdminListMeta;
}

export interface AdminOrderItem {
  productId: string;
  variantId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  userId: { _id: string; email: string } | string;
  items: AdminOrderItem[];
  paymentMethod: string;
  paymentStatus: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
}

export interface AdminOrdersListResponse {
  orders: AdminOrder[];
  meta: AdminListMeta;
}

export interface AdminRole {
  _id: string;
  name: string;
  permissions?: AdminPermission[];
}

export interface AdminPermission {
  _id: string;
  action: string;
  resource: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  displayName?: string;
  roles: AdminRole[];
  createdAt: string;
}

export interface AdminUsersListResponse {
  users: AdminUser[];
}

export interface AdminRolesListResponse {
  roles: AdminRole[];
}

export interface AdminPermissionsListResponse {
  permissions: AdminPermission[];
}

export interface AdminInventoryItem {
  _id: string;
  variantId: {
    _id: string;
    productId?: { _id: string; name: string } | string;
    size?: string;
    color?: string;
    sku?: string;
    price?: number;
  };
  available: number;
  reserved: number;
  sold: number;
  updatedAt: string;
}

export interface AdminInventoryListResponse {
  inventories: AdminInventoryItem[];
  meta: AdminListMeta;
}
