import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  isAuthenticated: boolean
  children?: React.ReactNode
}

export function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
