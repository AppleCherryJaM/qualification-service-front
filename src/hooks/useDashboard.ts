import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import { useAuthStore } from '../stores/authStore'
import { hasRole } from '../utils/roles'

export function useDashboardStats() {
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []
  const employeeId = user?.employeeId

  const isAdmin = hasRole(userRoles, ['admin'])
  const isHr = hasRole(userRoles, ['hr'])
  const isManager = hasRole(userRoles, ['manager']) && !hasRole(userRoles, ['admin', 'hr'])
  const isEmployee = hasRole(userRoles, ['employee']) && !hasRole(userRoles, ['admin', 'hr', 'manager'])

  return useQuery({
    queryKey: ['dashboard', user?.id],
    // Не делаем запрос пока нет авторизованного пользователя —
    // иначе запрос летит в момент гидрации когда user ещё null
    enabled: !!user,
    queryFn: () => {
      if (isAdmin || isHr) return dashboardApi.getStats()
      if (isManager && employeeId) return dashboardApi.getManagerStats(employeeId)
      if (isEmployee && employeeId) return dashboardApi.getEmployeeStats(employeeId)
      return dashboardApi.getStats()
    },
    refetchInterval: 60_000,
    retry: false, // не ретраить — interceptor сам обработает 401
  })
}