import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { EmployeesPage } from './pages/Employees/EmployeesPage'
import { NotFoundPage } from './pages/NotFound/NotFoundPage'
import { ProtectedRoute } from './components/RoleGuard/ProtectedRoute'

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        {/* TODO: добавить остальные маршруты */}
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
