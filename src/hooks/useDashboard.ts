// src/hooks/useDashboard.ts
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
    queryFn: () => {
      if (isAdmin || isHr) return dashboardApi.getStats()
      if (isManager && employeeId) {
        // TODO: получить departmentId из профиля сотрудника
        return dashboardApi.getManagerStats(employeeId) // временно — нужен реальный deptId
      }
      if (isEmployee && employeeId) return dashboardApi.getEmployeeStats(employeeId)
      return dashboardApi.getStats()
    },
    refetchInterval: 60000, // обновляем каждую минуту
  })
}