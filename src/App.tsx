import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { apiClient, setAuthReady } from './api/client'
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
import { DepartmentsPage } from './pages/DepartmentsPge/DepartmentsPage';
import { PositionsPage } from './pages/PositionsPage/PositionsPage';
import { TrainingTypesPage } from './pages/TrainigTypesPage/TrainingTypesPage';
import { BriefingsPage } from './pages/Briefings/BriefingsPage';
import { InternshipsPage } from './pages/InternshipsPage/InternshipsPage';

function App() {
  const navigate = useNavigate()
  const [isHydrated, setIsHydrated] = useState(() => {
    return !!(localStorage.getItem(TOKEN_KEY) && localStorage.getItem('auth-storage'))
      || useAuthStore.persist.hasHydrated()
  })
  const [isAuthValidating, setIsAuthValidating] = useState(true)
  const [isAuthValid, setIsAuthValid] = useState(false)
  const hydratedRef = useRef(false)

  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
      return
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      if (!hydratedRef.current) {
        hydratedRef.current = true
        setIsHydrated(true)
      }
    })
    if (useAuthStore.persist.hasHydrated() && !hydratedRef.current) {
      hydratedRef.current = true
      setIsHydrated(true)
    }
    return unsub
  }, [])

  // Валидация токена при старте и при изменении token
  useEffect(() => {
    if (!isHydrated) return

    const currentToken = useAuthStore.getState().token
    
    if (!currentToken) {
      setAuthReady(true)
      setIsAuthValidating(false)
      setIsAuthValid(false)
      return
    }

    setIsAuthValidating(true)
    setAuthReady(false)
    
    apiClient.get('/users/me')
      .then(() => {
        setAuthReady(true)
        setIsAuthValid(true)
        setIsAuthValidating(false)
      })
      .catch((error) => {
        console.log('[App] Token validation failed:', error.response?.status)
        setAuthReady(true)
        setIsAuthValid(false)
        setIsAuthValidating(false)
        // Если 401 — разлогиниваем через store (triggerLogout уже вызван в интерсепторе)
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
        }
      })
  }, [isHydrated, token])

  // Редирект при изменении isAuthValid
  useEffect(() => {
    if (!isHydrated || isAuthValidating) return

    if (!isAuthValid && !token) {
      // Неавторизован — редирект на логин
      navigate('/login', { replace: true })
    }
  }, [isAuthValid, isAuthValidating, isHydrated, token, navigate])

  useEffect(() => {
    console.log(
      '[App] state changed:',
      '| isHydrated:', isHydrated,
      '| isAuthValidating:', isAuthValidating,
      '| isAuthValid:', isAuthValid,
      '| token:', !!token,
      '| user:', !!user
    )
  }, [token, user, isHydrated, isAuthValidating, isAuthValid])

  // Пока гидрируем или валидируем токен — показываем лоадер
  if (!isHydrated || isAuthValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  const isAuthenticated = isAuthValid && !!token && !!user

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
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="positions" element={<PositionsPage />} />
        <Route path="training-types" element={<TrainingTypesPage />} />
        <Route path="briefings" element={<BriefingsPage />} />
        <Route path="internships" element={<InternshipsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App