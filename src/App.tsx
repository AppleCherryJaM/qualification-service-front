import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppLayout } from './components/Layout/AppLayout'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { EmployeesPage } from './pages/Employees/EmployeesPage'
import { CoursesPage } from './pages/Courses/CoursesPage'
import { AssignmentsPage } from './pages/Assignments/AssignmentsPage'
import { TestsPage } from './pages/Tests/TestPage'
import { NotificationsPage } from './pages/Notifications/NotificationsPage'
import { ReportsPage } from './pages/Reports/ReportsPage'
import { NotFoundPage } from './pages/NotFound/NotFoundPage'
import { CircularProgress, Box } from '@mui/material'
import { TOKEN_KEY } from './utils/constants'

function App() {
  // Ждём гидрацию вручную — onRehydrateStorage ненадёжен в некоторых версиях zustand.
  // Подписываемся на store ДО рендера и ждём пока persist восстановит данные.
  const [isHydrated, setIsHydrated] = useState(false)
  const hydratedRef = useRef(false)

  useEffect(() => {
    // Если store уже гидрирован (например повторный рендер) — сразу true
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
      return
    }
    // Иначе ждём события завершения гидрации
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      if (!hydratedRef.current) {
        hydratedRef.current = true
        setIsHydrated(true)
      }
    })
    // Страховка: если событие уже произошло до подписки
    if (useAuthStore.persist.hasHydrated() && !hydratedRef.current) {
      hydratedRef.current = true
      setIsHydrated(true)
    }
    return unsub
  }, [])

  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  // Дебаг — убрать после подтверждения фикса
  useEffect(() => {
    console.log(
      '[App] state changed:',
      '| isHydrated:', isHydrated,
      '| token:', !!token,
      '| user:', !!user,
      '| lsToken:', !!localStorage.getItem(TOKEN_KEY)
    )
  }, [token, user, isHydrated])

  if (!isHydrated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isAuthenticated = !!token && !!user

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="tests" element={<TestsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App