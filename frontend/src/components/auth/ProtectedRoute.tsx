import { useAuthStore } from "@/stores/useAuthStore"
import { hasAnyRole } from "@/lib/roles"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  allowRoles?: string[]
  children: React.ReactNode
}

const ProtectedRoute = ({ allowRoles, children }: ProtectedRouteProps) => {
  const { token, user } = useAuthStore()

  if (!token || !user) {
    return <Navigate to="/" replace />
  }

  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    const rolesSource = Array.isArray(user.roleNames) && user.roleNames.length
      ? user.roleNames
      : user.roles

    if (!hasAnyRole(rolesSource, allowRoles)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
