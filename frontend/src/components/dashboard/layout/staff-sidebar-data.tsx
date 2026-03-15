import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingBagIcon,
  LifeBuoyIcon,
  SendIcon,
} from "lucide-react";
import type { SidebarData } from "@/components/sidebar/app-sidebar";

export const staffSidebarData: SidebarData = {
  user: {
    name: "Staff",
    email: "staff@crownline.co",
    avatar: "/avatars/staff.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/staff",
      icon: <LayoutDashboardIcon />,
      isActive: true,
      items: [
        { title: "Summary", url: "/dashboard/staff" },
        { title: "Tasks", url: "/dashboard/staff/tasks" },
      ],
    },
    {
      title: "Products",
      url: "/dashboard/staff/products",
      icon: <PackageIcon />,
      items: [
        { title: "All Products", url: "/dashboard/staff/products" },
        { title: "Inventory", url: "/dashboard/staff/inventory" },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/staff/orders",
      icon: <ShoppingBagIcon />,
      items: [
        { title: "All Orders", url: "/dashboard/staff/orders" },
        { title: "Pick & Pack", url: "/dashboard/staff/fulfillment" },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "/support", icon: <LifeBuoyIcon /> },
    { title: "Feedback", url: "/feedback", icon: <SendIcon /> },
  ],
  projects: [],
};
