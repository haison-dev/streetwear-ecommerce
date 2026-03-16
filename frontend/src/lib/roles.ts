export const getRoleNames = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) return []

  return roles
    .map((role) => {
      if (typeof role === "string") return role.toLowerCase()
      if (role && typeof role === "object" && "name" in role) {
        return String((role as { name?: string }).name || "").toLowerCase()
      }
      return ""
    })
    .filter(Boolean)
}

export const hasAnyRole = (roles: unknown, requiredRoles: string[]) => {
  const roleNames = getRoleNames(roles)
  const normalizedRequiredRoles = requiredRoles.map((role) => role.toLowerCase())
  return normalizedRequiredRoles.some((role) => roleNames.includes(role))
}
