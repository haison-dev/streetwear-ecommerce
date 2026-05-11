import DashboardLayout from "@/components/dashboard/layout/DashboardLayout";
import { adminSidebarData } from "@/components/dashboard/layout/admin-sidebar-data";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminDashboardStore } from "@/stores/useAdminDashboardStore";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useAdminBrandsQuery,
  useAdminCategoriesQuery,
  useAdminCollectionsQuery,
  useAdminInventoryQuery,
  useAdminOrdersQuery,
  useAdminPermissionsQuery,
  useAdminProductsQuery,
  useAdminRolesQuery,
  useAdminUsersQuery,
  useCreateBrandMutation,
  useCreateCategoryMutation,
  useCreateProductMutation,
  useCreateRoleMutation,
  useDeleteProductMutation,
  useUpdateBrandStatusMutation,
  useUpdateCategoryStatusMutation,
  useUpdateInventoryMutation,
  useUpdateOrderStatusMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useUpdateRoleMutation,
  useUpdateUserRolesMutation,
} from "@/hooks/useAdminDashboardQueries";
import { adminService } from "@/services/adminService";
import type { AdminStatus, OrderStatus, Product, ProductStatus } from "@/types";
import { toast } from "sonner";
import { getRoleNames } from "@/lib/roles";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from "recharts";

const sectionTitleMap: Record<string, string> = {
  overview: "Summary",
  analytics: "Analytics",
  products: "All Products",
  categories: "Categories",
  brands: "Brands",
  inventory: "Inventory",
  orders: "All Orders",
  returns: "Returns",
  users: "Customers",
  staff: "Staff",
  reports: "Reports",
  settings: "Settings",
};

type ProductFormState = {
  name: string;
  price: string;
  salePrice: string;
  description: string;
  status: ProductStatus;
  categoryId: string;
  brandId: string;
  images: string[];
};

type DashboardProduct = Product & {
  description?: string;
  status?: ProductStatus;
};

const buildEmptyProductForm = (): ProductFormState => ({
  name: "",
  price: "",
  salePrice: "",
  description: "",
  status: "active",
  categoryId: "",
  brandId: "",
  images: [],
});

const AdminDashboard = () => {
  const { pathname } = useLocation();
  const {
    productPage,
    orderPage,
    categoryPage,
    brandPage,
    inventoryPage,
    pageSize,
    setProductPage,
    setOrderPage,
    setCategoryPage,
    setBrandPage,
    setInventoryPage,
  } = useAdminDashboardStore();

  const sectionPath = pathname
    .replace("/dashboard/admin", "")
    .replace(/^\/+/, "");
  const activeSection = (sectionPath || "overview").split("/")[0];

  const productsQuery = useAdminProductsQuery({
    page: productPage,
    limit: pageSize,
  });
  const ordersQuery = useAdminOrdersQuery({ page: orderPage, limit: pageSize });
  const categoriesQuery = useAdminCategoriesQuery({
    page: categoryPage,
    limit: pageSize,
  });
  const brandsQuery = useAdminBrandsQuery({ page: brandPage, limit: pageSize });
  const inventoryQuery = useAdminInventoryQuery({
    page: inventoryPage,
    limit: pageSize,
  });
  const usersQuery = useAdminUsersQuery();
  const rolesQuery = useAdminRolesQuery();
  const permissionsQuery = useAdminPermissionsQuery();
  const collectionsQuery = useAdminCollectionsQuery();

  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const updateProductStatusMutation = useUpdateProductStatusMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryStatusMutation = useUpdateCategoryStatusMutation();
  const createBrandMutation = useCreateBrandMutation();
  const updateBrandStatusMutation = useUpdateBrandStatusMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const updateUserRolesMutation = useUpdateUserRolesMutation();
  const updateInventoryMutation = useUpdateInventoryMutation();
  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(
    buildEmptyProductForm(),
  );
  const [isUploadingProductImages, setIsUploadingProductImages] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [userRoleDraft, setUserRoleDraft] = useState<Record<string, string[]>>(
    {},
  );
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [inventoryDraft, setInventoryDraft] = useState<Record<string, string>>({});
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryProductFilter, setInventoryProductFilter] = useState("all");
  const [inventoryStockFilter, setInventoryStockFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productBrandFilter, setProductBrandFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [previewProduct, setPreviewProduct] = useState<DashboardProduct | null>(null);
  const [actionSelectNonce, setActionSelectNonce] = useState<Record<string, number>>({});

  const authUser = useAuthStore((state) => state.user);
  const authRoleNames =
    Array.isArray(authUser?.roleNames) && authUser.roleNames.length
      ? authUser.roleNames.map((role) => String(role).toLowerCase())
      : getRoleNames(authUser?.roles);
  const canManageProducts = authRoleNames.includes("admin");

  const totalRevenue = useMemo(
    () =>
      (ordersQuery.data?.orders || []).reduce((sum, order) => {
        if (order.paymentStatus === "paid")
          return sum + Number(order.totalPrice || 0);
        return sum;
      }, 0),
    [ordersQuery.data?.orders],
  );

  const totalProducts = productsQuery.data?.meta.total || 0;
  const totalOrders = ordersQuery.data?.meta.total || 0;
  const totalUsers = usersQuery.data?.users.length || 0;
  const totalLowStock = (inventoryQuery.data?.inventories || []).filter(
    (i) => i.available < 5,
  ).length;
  const totalActiveProducts = (productsQuery.data?.products || []).filter(
    (product) => ((product as { status?: string }).status || "active") === "active",
  ).length;
  const totalPaidOrders = (ordersQuery.data?.orders || []).filter(
    (order) => order.paymentStatus === "paid",
  ).length;
  const pendingOrders = (ordersQuery.data?.orders || []).filter(
    (order) => order.status === "pending",
  ).length;
  const cancelledOrders = (ordersQuery.data?.orders || []).filter(
    (order) => order.status === "cancelled",
  ).length;
  const averageOrderValue = totalPaidOrders > 0 ? totalRevenue / totalPaidOrders : 0;

  const revenueToday = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    return (ordersQuery.data?.orders || [])
      .filter((order) => order.paymentStatus === "paid")
      .filter((order) => {
        const t = new Date(order.createdAt);
        return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
      })
      .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  }, [ordersQuery.data?.orders]);

  const revenueYesterday = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const y = yesterday.getFullYear();
    const m = yesterday.getMonth();
    const d = yesterday.getDate();
    return (ordersQuery.data?.orders || [])
      .filter((order) => order.paymentStatus === "paid")
      .filter((order) => {
        const t = new Date(order.createdAt);
        return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
      })
      .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
  }, [ordersQuery.data?.orders]);

  const revenueDeltaPct =
    revenueYesterday > 0
      ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100
      : revenueToday > 0
        ? 100
        : 0;

  const orderStatusData = useMemo(() => {
    const source = ordersQuery.data?.orders || [];
    const buckets: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
    };
    source.forEach((order) => {
      buckets[order.status] = (buckets[order.status] || 0) + 1;
    });
    return Object.entries(buckets).map(([status, count]) => ({
      status,
      count,
    }));
  }, [ordersQuery.data?.orders]);

  const revenueTrendData = useMemo(() => {
    const source = ordersQuery.data?.orders || [];
    const dateMap = new Map<string, number>();

    source
      .filter((order) => order.paymentStatus === "paid")
      .forEach((order) => {
        const key = new Date(order.createdAt).toISOString().slice(0, 10);
        dateMap.set(key, (dateMap.get(key) || 0) + Number(order.totalPrice || 0));
      });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, revenue]) => ({
        date: date.slice(5),
        revenue: Math.round(revenue),
      }));
  }, [ordersQuery.data?.orders]);

  const inventoryHealthData = useMemo(() => {
    const source = inventoryQuery.data?.inventories || [];
    const low = source.filter((item) => item.available < 5).length;
    const medium = source.filter((item) => item.available >= 5 && item.available < 20).length;
    const healthy = source.filter((item) => item.available >= 20).length;
    return [
      { name: "Low (<5)", value: low, fill: "var(--color-low)" },
      { name: "Medium (5-19)", value: medium, fill: "var(--color-medium)" },
      { name: "Healthy (20+)", value: healthy, fill: "var(--color-healthy)" },
    ];
  }, [inventoryQuery.data?.inventories]);

  const lowStockRows = useMemo(
    () =>
      (inventoryQuery.data?.inventories || [])
        .filter((item) => item.available < 5)
        .slice(0, 6),
    [inventoryQuery.data?.inventories],
  );

  const topSellingRows = useMemo(
    () =>
      [...(inventoryQuery.data?.inventories || [])]
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 6),
    [inventoryQuery.data?.inventories],
  );

  const statusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "outline" => {
    if (status === "active" || status === "delivered" || status === "paid")
      return "default";
    if (status === "pending" || status === "confirmed" || status === "shipping")
      return "secondary";
    return "outline";
  };

  const isSubmittingProduct =
    createProductMutation.isPending || updateProductMutation.isPending;

  const closeProductModal = () => {
    if (isSubmittingProduct || isUploadingProductImages) return;
    setProductModalOpen(false);
    setEditingProductId(null);
    setProductForm(buildEmptyProductForm());
  };

  const openCreateProductModal = () => {
    setProductModalMode("create");
    setEditingProductId(null);
    setProductForm({
      ...buildEmptyProductForm(),
      categoryId: categoriesQuery.data?.categories?.[0]?._id || "",
      brandId: brandsQuery.data?.brands?.[0]?._id || "",
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: DashboardProduct) => {
    setProductModalMode("edit");
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || "",
      price: String(product.price ?? ""),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      description: product.description || "",
      status: product.status || "active",
      categoryId:
        typeof product.categoryId === "string"
          ? product.categoryId
          : product.categoryId?._id || "",
      brandId:
        typeof product.brandId === "string"
          ? product.brandId
          : product.brandId?._id || "",
      images: Array.isArray(product.images) ? [...product.images] : [],
    });
    setProductModalOpen(true);
  };

  const uploadProductImages = async (files: File[]) => {
    if (!files.length) return;
    setIsUploadingProductImages(true);
    try {
      const imageUrls = await adminService.uploadProductImages(files);
      setProductForm((current) => ({
        ...current,
        images: [...current.images, ...imageUrls],
      }));
      toast.success("Uploaded product images");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload images";
      toast.error(message);
    } finally {
      setIsUploadingProductImages(false);
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm((current) => ({
      ...current,
      images: current.images.filter((_, idx) => idx !== index),
    }));
  };

  const submitProductModal = async () => {
    const name = productForm.name.trim();
    const categoryId = productForm.categoryId;
    const brandId = productForm.brandId;
    const price = Number(productForm.price);
    const salePrice = productForm.salePrice
      ? Number(productForm.salePrice)
      : undefined;

    if (!name || !categoryId || !brandId) {
      toast.error("Name, category and brand are required");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      toast.error("Price must be a valid number");
      return;
    }

    if (salePrice !== undefined && (Number.isNaN(salePrice) || salePrice < 0)) {
      toast.error("Sale price must be a valid number");
      return;
    }

    const payload = {
      name,
      price,
      salePrice,
      categoryId,
      brandId,
      description: productForm.description.trim() || undefined,
      images: productForm.images,
      status: productForm.status,
    };

    if (productModalMode === "create") {
      await createProductMutation.mutateAsync(payload);
      closeProductModal();
      return;
    }

    if (!editingProductId) {
      toast.error("No product selected for update");
      return;
    }

    await updateProductMutation.mutateAsync({
      productId: editingProductId,
      payload,
    });
    closeProductModal();
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId],
    );
  };

  const toggleUserRole = (userId: string, roleId: string, checked: boolean) => {
    const current = userRoleDraft[userId] || [];
    const next = checked
      ? Array.from(new Set([...current, roleId]))
      : current.filter((id) => id !== roleId);
    setUserRoleDraft((prev) => ({ ...prev, [userId]: next }));
  };

  const availableBrandFilters = useMemo(() => {
    const names = new Set<string>();
    (productsQuery.data?.products || []).forEach((product) => {
      if (product.brandId?.name) names.add(product.brandId.name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [productsQuery.data?.products]);

  const availableCategoryFilters = useMemo(() => {
    const names = new Set<string>();
    (productsQuery.data?.products || []).forEach((product) => {
      if (product.categoryId?.name) names.add(product.categoryId.name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [productsQuery.data?.products]);

  const filteredProducts = useMemo(() => {
    const source = productsQuery.data?.products || [];
    const q = productSearch.trim().toLowerCase();
    return source.filter((product) => {
      const status = ((product as { status?: string }).status || "active").toLowerCase();
      const brand = (product.brandId?.name || "").toLowerCase();
      const category = (product.categoryId?.name || "").toLowerCase();
      const name = (product.name || "").toLowerCase();

      if (q && !name.includes(q) && !brand.includes(q) && !category.includes(q)) return false;
      if (productStatusFilter !== "all" && status !== productStatusFilter) return false;
      if (productBrandFilter !== "all" && brand !== productBrandFilter.toLowerCase()) return false;
      if (productCategoryFilter !== "all" && category !== productCategoryFilter.toLowerCase()) return false;
      return true;
    });
  }, [
    productsQuery.data?.products,
    productSearch,
    productStatusFilter,
    productBrandFilter,
    productCategoryFilter,
  ]);

  const inventoryProductFilterOptions = useMemo(() => {
    const names = new Set<string>();
    (inventoryQuery.data?.inventories || []).forEach((inventory) => {
      const name =
        inventory.variantId?.productId &&
        typeof inventory.variantId.productId !== "string"
          ? inventory.variantId.productId.name
          : "";
      if (name) names.add(name);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [inventoryQuery.data?.inventories]);

  const filteredInventories = useMemo(() => {
    const source = inventoryQuery.data?.inventories || [];
    const q = inventorySearch.trim().toLowerCase();
    return source.filter((inventory) => {
      const productName =
        inventory.variantId?.productId &&
        typeof inventory.variantId.productId !== "string"
          ? inventory.variantId.productId.name
          : "";
      const variantLabel = `${inventory.variantId?.size || ""} ${inventory.variantId?.color || ""}`.trim();
      const sku = inventory.variantId?.sku || "";

      if (q) {
        const haystack = `${productName} ${variantLabel} ${sku}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (inventoryProductFilter !== "all" && productName !== inventoryProductFilter) {
        return false;
      }

      if (inventoryStockFilter === "low" && inventory.available >= 5) return false;
      if (
        inventoryStockFilter === "medium" &&
        (inventory.available < 5 || inventory.available >= 20)
      ) {
        return false;
      }
      if (inventoryStockFilter === "healthy" && inventory.available < 20) return false;

      return true;
    });
  }, [
    inventoryQuery.data?.inventories,
    inventorySearch,
    inventoryProductFilter,
    inventoryStockFilter,
  ]);

  const bumpActionSelectNonce = (productId: string) => {
    setActionSelectNonce((current) => ({
      ...current,
      [productId]: (current[productId] || 0) + 1,
    }));
  };

  const handleProductAction = async (
    product: Product,
    action: "view" | "edit" | "delete",
  ) => {
    if (action === "view") {
      setPreviewProduct(product as DashboardProduct);
      return;
    }
    if (!canManageProducts) return;
    if (action === "edit") {
      openEditProductModal(product as DashboardProduct);
      return;
    }
    if (action === "delete") {
      const yes = window.confirm(`Delete product "${product.name}"?`);
      if (!yes) return;
      await deleteProductMutation.mutateAsync(product._id);
    }
  };

  const getInventoryDraftValue = (inventoryId: string, currentAvailable: number) => {
    const raw = inventoryDraft[inventoryId];
    return raw ?? String(currentAvailable);
  };

  const setInventoryAvailableDraft = (inventoryId: string, value: string) => {
    if (/^\d*$/.test(value)) {
      setInventoryDraft((current) => ({ ...current, [inventoryId]: value }));
    }
  };

  const renderOverviewCards = (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Products</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {totalProducts}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {totalOrders}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {totalUsers}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Paid Revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          ${totalRevenue.toFixed(2)}
        </CardContent>
      </Card>
    </div>
  );

  const renderOverviewSummary = (
    <div className="space-y-4">
      {renderOverviewCards}
      <Card>
        <CardHeader>
          <CardTitle>Operational Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Active products</p>
            <p className="text-xl font-semibold">{totalActiveProducts}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Paid orders (current page)</p>
            <p className="text-xl font-semibold">{totalPaidOrders}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Low stock variants</p>
            <p className="text-xl font-semibold">{totalLowStock}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Collections</p>
            <p className="text-xl font-semibold">
              {collectionsQuery.data?.meta.total || collectionsQuery.data?.collections.length || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">${revenueToday.toFixed(2)}</p>
            <p
              className={`text-xs ${revenueDeltaPct >= 0 ? "text-emerald-600" : "text-destructive"}`}
            >
              {revenueDeltaPct >= 0 ? "+" : ""}
              {revenueDeltaPct.toFixed(1)}% vs yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pendingOrders}</p>
            <p className="text-xs text-muted-foreground">Needs fulfillment follow-up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cancelled Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{cancelledOrders}</p>
            <p className="text-xs text-muted-foreground">Monitor cancellation reasons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">${averageOrderValue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Based on paid orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low-stock variants on current page.</p>
            ) : (
              <div className="space-y-2">
                {lowStockRows.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.variantId?.productId &&
                        typeof item.variantId.productId !== "string"
                          ? item.variantId.productId.name
                          : item.variantId?._id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantId?.sku || "-"} • {item.variantId?.size || "-"} /{" "}
                        {item.variantId?.color || "-"}
                      </p>
                    </div>
                    <Badge variant="outline">Available: {item.available}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Variants</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellingRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales data yet.</p>
            ) : (
              <div className="space-y-2">
                {topSellingRows.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.variantId?.productId &&
                        typeof item.variantId.productId !== "string"
                          ? item.variantId.productId.name
                          : item.variantId?._id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantId?.sku || "-"} • {item.variantId?.size || "-"} /{" "}
                        {item.variantId?.color || "-"}
                      </p>
                    </div>
                    <Badge>Sold: {item.sold || 0}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOverviewAnalytics = (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Paid Revenue Trend (latest 7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-64 w-full"
            config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-1))" } }}
          >
            <BarChart data={revenueTrendData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" radius={6} fill="var(--color-revenue)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Mix</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-64 w-full"
            config={{
              pending: { label: "Pending", color: "hsl(var(--chart-2))" },
              confirmed: { label: "Confirmed", color: "hsl(var(--chart-3))" },
              shipping: { label: "Shipping", color: "hsl(var(--chart-4))" },
              delivered: { label: "Delivered", color: "hsl(var(--chart-5))" },
              cancelled: { label: "Cancelled", color: "hsl(var(--muted-foreground))" },
            }}
          >
            <BarChart data={orderStatusData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={6}>
                {orderStatusData.map((entry) => (
                  <Cell key={entry.status} fill={`var(--color-${entry.status})`} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Inventory Health</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-72 w-full"
            config={{
              low: { label: "Low", color: "hsl(var(--destructive))" },
              medium: { label: "Medium", color: "hsl(var(--chart-3))" },
              healthy: { label: "Healthy", color: "hsl(var(--chart-2))" },
            }}
          >
            <PieChart>
              <Pie
                data={inventoryHealthData}
                dataKey="value"
                nameKey="name"
                innerRadius={68}
                outerRadius={112}
                paddingAngle={3}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Products</CardTitle>
          {canManageProducts ? (
            <Button onClick={openCreateProductModal}>Create Product</Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-4">
          <Input
            placeholder="Search by name / brand / category"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={productBrandFilter} onValueChange={setProductBrandFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {availableBrandFilters.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {availableCategoryFilters.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product._id}>
                <TableCell>
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground ring-1 ring-border">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brandId?.name || "-"}</TableCell>
                <TableCell>{product.categoryId?.name || "-"}</TableCell>
                <TableCell>
                  ${Number(product.salePrice ?? product.price).toFixed(2)}
                </TableCell>
                <TableCell>
                  {canManageProducts ? (
                    <Select
                      value={((product as { status?: string }).status || "active").toLowerCase()}
                      onValueChange={(value) => {
                        void updateProductStatusMutation.mutateAsync({
                          productId: product._id,
                          status: value as ProductStatus,
                        });
                      }}
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={6}
                      >
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="draft">draft</SelectItem>
                        <SelectItem value="archived">archived</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant={statusBadgeVariant(
                        (product as { status?: string }).status || "active",
                      )}
                    >
                      {(product as { status?: string }).status || "active"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    key={`${product._id}-${actionSelectNonce[product._id] || 0}`}
                    onValueChange={(value) => {
                      void handleProductAction(
                        product,
                        value as "view" | "edit" | "delete",
                      ).finally(() => bumpActionSelectNonce(product._id));
                    }}
                  >
                    <SelectTrigger size="sm" className="w-32">
                      <SelectValue placeholder="Actions" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      align="start"
                      sideOffset={6}
                    >
                      <SelectItem value="view">View details</SelectItem>
                      {canManageProducts ? (
                        <>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                        </>
                      ) : null}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products match current filters.</p>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setProductPage(Math.max(1, productPage - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">Page {productPage}</span>
          <Button
            variant="outline"
            onClick={() => setProductPage(productPage + 1)}
          >
            Next
          </Button>
        </div>

        <Dialog
          open={Boolean(previewProduct)}
          onOpenChange={(open) => {
            if (!open) setPreviewProduct(null);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewProduct?.name || "Product details"}</DialogTitle>
              <DialogDescription>
                Detailed product information for quick review.
              </DialogDescription>
            </DialogHeader>

            {previewProduct ? (
              <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-3">
                  {(previewProduct.images || []).length ? (
                    previewProduct.images.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`${previewProduct.name}-${index + 1}`}
                        className="h-36 w-full rounded-md object-cover ring-1 ring-border"
                      />
                    ))
                  ) : (
                    <div className="col-span-3 rounded-md border p-4 text-sm text-muted-foreground">
                      No product images
                    </div>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <p className="font-medium">{previewProduct.brandId?.name || "-"}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium">{previewProduct.categoryId?.name || "-"}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-medium">${Number(previewProduct.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Sale price</p>
                    <p className="font-medium">
                      {previewProduct.salePrice
                        ? `$${Number(previewProduct.salePrice).toFixed(2)}`
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-md border p-3 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="font-medium">
                      {previewProduct.description?.trim() || "No description"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog
          open={productModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              closeProductModal();
              return;
            }
            setProductModalOpen(open);
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {productModalMode === "create"
                  ? "Create product"
                  : "Update product"}
              </DialogTitle>
              <DialogDescription>
                Manage product details and upload product images in one place.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-name">Product name</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((current) => ({
                      ...current,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((current) => ({
                      ...current,
                      price: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-sale-price">Sale price</Label>
                <Input
                  id="product-sale-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.salePrice}
                  onChange={(e) =>
                    setProductForm((current) => ({
                      ...current,
                      salePrice: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      categoryId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesQuery.data?.categories || []).map(
                      (category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={productForm.brandId}
                  onValueChange={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      brandId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {(brandsQuery.data?.brands || []).map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={productForm.status}
                  onValueChange={(value) =>
                    setProductForm((current) => ({
                      ...current,
                      status: value as ProductStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Optional product description"
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-image-upload">Product images</Label>
                <Input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploadingProductImages}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    await uploadProductImages(files);
                    e.target.value = "";
                  }}
                />
                {isUploadingProductImages ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner className="size-4" />
                    Uploading images...
                  </div>
                ) : null}
                {productForm.images.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {productForm.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="rounded-md border p-2"
                      >
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="mb-2 h-28 w-full rounded object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => removeProductImage(index)}
                        >
                          Remove image
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No images selected yet.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeProductModal}
                disabled={isSubmittingProduct || isUploadingProductImages}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitProductModal}
                disabled={isSubmittingProduct || isUploadingProductImages}
              >
                {isSubmittingProduct ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    Saving...
                  </span>
                ) : productModalMode === "create" ? (
                  "Create product"
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderOrders = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Low stock variants on this page: {totalLowStock}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(ordersQuery.data?.orders || []).map((order) => (
              <TableRow key={order._id}>
                <TableCell>
                  {order.orderNumber || order._id.slice(-8)}
                </TableCell>
                <TableCell>
                  {typeof order.userId === "string"
                    ? order.userId
                    : order.userId?.email}
                </TableCell>
                <TableCell>
                  ${Number(order.totalPrice || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      updateOrderStatusMutation.mutate({
                        orderId: order._id,
                        status: value as OrderStatus,
                      })
                    }
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="confirmed">confirmed</SelectItem>
                      <SelectItem value="shipping">shipping</SelectItem>
                      <SelectItem value="delivered">delivered</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOrderPage(Math.max(1, orderPage - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">Page {orderPage}</span>
          <Button variant="outline" onClick={() => setOrderPage(orderPage + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategories = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button
            size="sm"
            className="w-auto justify-self-start px-4"
            onClick={async () => {
              if (!newCategoryName) return;
              await createCategoryMutation.mutateAsync({
                name: newCategoryName,
                status: "active",
              });
              setNewCategoryName("");
            }}
          >
            Create
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(categoriesQuery.data?.categories || []).map((category) => (
              <TableRow key={category._id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeVariant(
                      (category as { status?: string }).status || "active",
                    )}
                  >
                    {(category as { status?: string }).status || "active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      updateCategoryStatusMutation.mutate({
                        categoryId: category._id,
                        status: value as AdminStatus,
                      })
                    }
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setCategoryPage(Math.max(1, categoryPage - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">Page {categoryPage}</span>
          <Button
            variant="outline"
            onClick={() => setCategoryPage(categoryPage + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBrands = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Brands</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            placeholder="Brand name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
          />
          <Button
            size="sm"
            className="w-auto justify-self-start px-4"
            onClick={async () => {
              if (!newBrandName) return;
              await createBrandMutation.mutateAsync({
                name: newBrandName,
                status: "active",
              });
              setNewBrandName("");
            }}
          >
            Create
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(brandsQuery.data?.brands || []).map((brand) => (
              <TableRow key={brand._id}>
                <TableCell>{brand.name}</TableCell>
                <TableCell>{brand.slug}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeVariant(
                      (brand as { status?: string }).status || "active",
                    )}
                  >
                    {(brand as { status?: string }).status || "active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(value) =>
                      updateBrandStatusMutation.mutate({
                        brandId: brand._id,
                        status: value as AdminStatus,
                      })
                    }
                  >
                    <SelectTrigger size="sm">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setBrandPage(Math.max(1, brandPage - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">Page {brandPage}</span>
          <Button variant="outline" onClick={() => setBrandPage(brandPage + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderInventory = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-4">
          <Input
            placeholder="Search product / variant / SKU"
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
          />
          <Select
            value={inventoryProductFilter}
            onValueChange={setInventoryProductFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All products</SelectItem>
              {inventoryProductFilterOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={inventoryStockFilter} onValueChange={setInventoryStockFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Stock level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stock levels</SelectItem>
              <SelectItem value="low">Low (&lt;5)</SelectItem>
              <SelectItem value="medium">Medium (5-19)</SelectItem>
              <SelectItem value="healthy">Healthy (20+)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="w-auto justify-self-start px-4"
            onClick={() => {
              setInventorySearch("");
              setInventoryProductFilter("all");
              setInventoryStockFilter("all");
            }}
          >
            Reset filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventories.map((inventory) => (
              <TableRow key={inventory._id}>
                <TableCell>
                  {inventory.variantId?.productId &&
                  typeof inventory.variantId.productId !== "string"
                    ? inventory.variantId.productId.name
                    : "-"}
                </TableCell>
                <TableCell>
                  {inventory.variantId?.productId &&
                  typeof inventory.variantId.productId !== "string"
                    ? `${inventory.variantId.size || "-"} / ${inventory.variantId.color || "-"}`
                    : inventory.variantId?._id}
                </TableCell>
                <TableCell>{inventory.variantId?.sku || "-"}</TableCell>
                <TableCell>{inventory.available}</TableCell>
                <TableCell>{inventory.reserved}</TableCell>
                <TableCell>{inventory.sold}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="h-8 w-24"
                      value={getInventoryDraftValue(inventory._id, inventory.available)}
                      onChange={(e) =>
                        setInventoryAvailableDraft(inventory._id, e.target.value)
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const nextAvailable = Number(
                          getInventoryDraftValue(inventory._id, inventory.available),
                        );
                        if (Number.isNaN(nextAvailable) || nextAvailable < 0) {
                          toast.error("Available must be a valid non-negative number");
                          return;
                        }
                        updateInventoryMutation.mutate({
                          variantId: inventory.variantId._id,
                          available: nextAvailable,
                          reserved: inventory.reserved,
                          sold: inventory.sold,
                        });
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredInventories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No inventory rows match current filters.
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setInventoryPage(Math.max(1, inventoryPage - 1))}
          >
            Prev
          </Button>
          <span className="text-sm">Page {inventoryPage}</span>
          <Button
            variant="outline"
            onClick={() => setInventoryPage(inventoryPage + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderUsers = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Role Assignment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(usersQuery.data?.users || []).map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.displayName || "-"}</TableCell>
                <TableCell>
                  {(user.roles || []).map((role) => role.name).join(", ") ||
                    "-"}
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="grid gap-1">
                      {(rolesQuery.data?.roles || []).map((role) => {
                        const draft =
                          userRoleDraft[user._id] ||
                          (user.roles || []).map((item) => item._id);
                        const checked = draft.includes(role._id);
                        return (
                          <label
                            key={role._id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                toggleUserRole(
                                  user._id,
                                  role._id,
                                  e.target.checked,
                                )
                              }
                            />
                            <span>{role.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <Button
                      size="sm"
                      onClick={async () => {
                        const roleIds =
                          userRoleDraft[user._id] ||
                          (user.roles || []).map((item) => item._id);
                        await updateUserRolesMutation.mutateAsync({
                          userId: user._id,
                          roleIds,
                        });
                      }}
                    >
                      Save roles
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCollections = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sort Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(collectionsQuery.data?.collections || []).map((collection) => (
              <TableRow key={collection._id}>
                <TableCell>{collection.name}</TableCell>
                <TableCell>{collection.slug}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(collection.status)}>
                    {collection.status}
                  </Badge>
                </TableCell>
                <TableCell>{collection.sortOrder}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderRoleSettings = (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Role & Permission Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          <Input
            placeholder="New role name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <Button
            onClick={async () => {
              if (!newRoleName.trim()) return;
              await createRoleMutation.mutateAsync({
                name: newRoleName.trim(),
                permissionIds: [],
              });
              setNewRoleName("");
            }}
          >
            Create role
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Select
            value={selectedRoleId}
            onValueChange={(value) => {
              setSelectedRoleId(value);
              const role = (rolesQuery.data?.roles || []).find(
                (item) => item._id === value,
              );
              setSelectedPermissionIds(
                (role?.permissions || []).map((item) => item._id),
              );
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role to manage permissions" />
            </SelectTrigger>
            <SelectContent>
              {(rolesQuery.data?.roles || []).map((role) => (
                <SelectItem key={role._id} value={role._id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            disabled={!selectedRoleId}
            onClick={async () => {
              if (!selectedRoleId) return;
              await updateRoleMutation.mutateAsync({
                roleId: selectedRoleId,
                payload: { permissionIds: selectedPermissionIds },
              });
            }}
          >
            Save permission mapping
          </Button>
        </div>

        <div className="rounded-md border p-3">
          <div className="mb-2 text-sm font-medium">Permissions</div>
          <div className="grid gap-1 md:grid-cols-2">
            {(permissionsQuery.data?.permissions || []).map((permission) => (
              <label
                key={permission._id}
                className="flex items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissionIds.includes(permission._id)}
                  onChange={() => togglePermission(permission._id)}
                  disabled={!selectedRoleId}
                />
                <span>
                  {permission.action}:{permission.resource}
                </span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return renderOverviewSummary;
      case "analytics":
        return (
          <div className="space-y-4">
            {renderOverviewCards}
            {renderOverviewAnalytics}
          </div>
        );
      case "products":
        return renderProducts;
      case "orders":
      case "returns":
        return renderOrders;
      case "categories":
        return renderCategories;
      case "brands":
        return renderBrands;
      case "inventory":
        return renderInventory;
      case "users":
      case "staff":
        return renderUsers;
      case "collections":
        return renderCollections;
      case "reports":
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{sectionTitleMap[activeSection]}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              .
            </CardContent>
          </Card>
        );
      case "settings":
        return renderRoleSettings;
      default:
        return renderOverviewSummary;
    }
  };

  return (
    <DashboardLayout
      title="Dashboard"
      section={sectionTitleMap[activeSection] || "Summary"}
      data={adminSidebarData}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
