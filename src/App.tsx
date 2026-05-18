// src/App.tsx — финальный рабочий вариант
import { useEffect, useState } from 'react'
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

function App() {
  const [isReady, setIsReady] = useState(false)

  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = !!token && !!user

  useEffect(() => {
    let unsub: (() => void) | undefined

    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true)
    } else {
      unsub = useAuthStore.persist.onFinishHydration(() => {
        setIsReady(true)
      })
    }

    return () => unsub?.()
  }, [])

  if (!isReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

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