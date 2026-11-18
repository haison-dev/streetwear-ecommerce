import { LayoutDashboard, UserRound } from "lucide-react";
import type { SidebarData } from "@/components/sidebar/app-sidebar";

export const staffSidebarData: SidebarData = {
  user: { name: "Staff", email: "", avatar: "" },
  navMain: [
    { title: "Order fulfillment", url: "/dashboard/staff", icon: <LayoutDashboard /> },
    { title: "Profile", url: "/dashboard/staff/account", icon: <UserRound /> },
  ],
  navSecondary: [],
  projects: [],
};
