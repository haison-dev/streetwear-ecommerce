import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const getRoleNames = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((role) => {
      if (typeof role === "string") return role.toLowerCase();
      if (role && typeof role === "object" && "name" in role) {
        return String((role as { name?: string }).name || "").toLowerCase();
      }
      return "";
    })
    .filter(Boolean);
};

const DashboardGate = () => {
  const { user } = useAuthStore();
  const roleNames = getRoleNames(user?.roles);

  if (roleNames.includes("admin")) return <Navigate to="/dashboard/admin" replace />;
  if (roleNames.includes("staff")) return <Navigate to="/dashboard/staff" replace />;

  return <Navigate to="/" replace />;
};

export default DashboardGate;
