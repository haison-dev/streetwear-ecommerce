import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { getRoleNames } from "@/lib/roles";

const DashboardGate = () => {
  const { token, user } = useAuthStore();

  if (!token || !user) return <Navigate to="/" replace />;

  const roleNames = Array.isArray(user?.roleNames) && user.roleNames.length
    ? user.roleNames.map((role) => String(role).toLowerCase())
    : getRoleNames(user?.roles);

  if (roleNames.includes("admin")) return <Navigate to="/dashboard/admin" replace />;
  if (roleNames.includes("staff")) return <Navigate to="/dashboard/staff" replace />;

  return <Navigate to="/" replace />;
};

export default DashboardGate;
