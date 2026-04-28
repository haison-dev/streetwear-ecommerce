import {
  LayoutDashboardIcon,
  ShoppingBagIcon,
  PackageIcon,
  UsersIcon,
  SettingsIcon,
  BarChart3Icon,
  LifeBuoyIcon,
  SendIcon,
} from "lucide-react";
import type { SidebarData } from "@/components/sidebar/app-sidebar";

export const adminSidebarData: SidebarData = {
  user: {
    name: "Admin",
    email: "admin@crownline.co",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/admin",
      icon: <LayoutDashboardIcon />,
      isActive: true,
      items: [
        { title: "Summary", url: "/dashboard/admin" },
        { title: "Analytics", url: "/dashboard/admin/analytics" },
      ],
    },
    {
      title: "Products",
      url: "/dashboard/admin/products",
      icon: <PackageIcon />,
      items: [
        { title: "All Products", url: "/dashboard/admin/products" },
        { title: "Categories", url: "/dashboard/admin/categories" },
        { title: "Brands", url: "/dashboard/admin/brands" },
        { title: "Inventory", url: "/dashboard/admin/inventory" },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/admin/orders",
      icon: <ShoppingBagIcon />,
      items: [
        { title: "All Orders", url: "/dashboard/admin/orders" },
        { title: "Returns", url: "/dashboard/admin/returns" },
      ],
    },
    {
      title: "Users",
      url: "/dashboard/admin/users",
      icon: <UsersIcon />,
      items: [
        { title: "Customers", url: "/dashboard/admin/users" },
        { title: "Staff", url: "/dashboard/admin/staff" },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard/admin/reports",
      icon: <BarChart3Icon />,
      items: [
        { title: "Revenue", url: "/dashboard/admin/reports/revenue" },
        { title: "Inventory", url: "/dashboard/admin/reports/inventory" },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/admin/settings",
      icon: <SettingsIcon />,
    },
  ],
  navSecondary: [
    { title: "Support", url: "/support", icon: <LifeBuoyIcon /> },
    { title: "Feedback", url: "/feedback", icon: <SendIcon /> },
  ],
  projects: [],
};
