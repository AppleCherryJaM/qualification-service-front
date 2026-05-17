import { hasRole } from '../../utils/roles'
import { useAuthStore } from '../../stores/authStore'

interface RoleGuardProps {
  allowedRoles: readonly string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []

  if (!hasRole(userRoles, allowedRoles)) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
