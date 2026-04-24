export function normalizeRole(role) {
  return (role || '').toString().trim().toLowerCase()
}

export function hasAllowedRole(userRole, allowedRoles = []) {
  if (!allowedRoles.length) return true
  const current = normalizeRole(userRole)
  return allowedRoles.map(normalizeRole).includes(current)
}

