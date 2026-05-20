// src/pages/Dashboard/DashboardPage.tsx — полностью переписанный
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, Paper, LinearProgress,
  Button, Chip, List, ListItem, ListItemText, ListItemIcon, Divider,
} from '@mui/material'
import {
  People as PeopleIcon, School as SchoolIcon, Warning as WarningIcon,
  TrendingUp as TrendingUpIcon, Block as BlockIcon, CheckCircle as CheckIcon,
  Assignment as AssignmentIcon, ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { useDashboardStats } from '../../hooks/useDashboard'
import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../utils/roles'
import { KpiCard } from '@/components/cards/KpiCard';

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []

  const isAdmin = hasRole(userRoles, ['admin'])
  const isHr = hasRole(userRoles, ['hr'])
  const isManager = hasRole(userRoles, ['manager']) && !hasRole(userRoles, ['admin', 'hr'])
  const isEmployee = hasRole(userRoles, ['employee']) && !hasRole(userRoles, ['admin', 'hr', 'manager'])

  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Дашборд</Typography>
        <LinearProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Дашборд</Typography>
        <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
          <Typography color="error">Ошибка загрузки данных</Typography>
        </Paper>
      </Box>
    )
  }

  const s = stats ?? {
    totalEmployees: 0,
    activeCourses: 0,
    overdueCount: 0,
    passRate: 0,
    blockedEmployees: 0,
    completedAssignments: 0,
    totalAssignments: 0,
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography variant="body1" color="text.secondary">
        Добро пожаловать, {user?.email}
      </Typography>
      {s.blockedEmployees > 0 && isAdmin && (
        <Chip label={`${s.blockedEmployees} заблокировано`} color="error" size="small" />
      )}
    </Box>

    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',  // 6 карточек в ряд
      gap: 2,  // 16px между карточками
      mt: 2,
      // Адаптив:
      '@media (max-width: 1200px)': {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      '@media (max-width: 900px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      '@media (max-width: 600px)': {
        gridTemplateColumns: '1fr',
      },
    }}>
      {(isAdmin || isHr) && (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
            <KpiCard
              title="Всего сотрудников"
              value={stats?.totalEmployees ?? 0}
              icon={<PeopleIcon sx={{ fontSize: 24 }} />}
              color="primary"
              onClick={() => navigate('/employees')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Активные курсы"
              value={stats?.activeCourses ?? 0}
              icon={<SchoolIcon sx={{ fontSize: 28 }} />}
              color="success"
              onClick={() => navigate('/courses')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Просрочки"
              value={stats?.overdueCount ?? 0}
              subtitle={`из ${stats?.totalAssignments ?? 0} назначений`}
              icon={<WarningIcon sx={{ fontSize: 28 }} />}
              color="error"
              onClick={() => navigate('/assignments')}
              trend={(stats?.totalAssignments ?? 0) > 0 ? {
                value: Math.round(((stats?.overdueCount ?? 0) / (stats?.totalAssignments ?? 1)) * 100),
                label: 'от общего числа'
              } : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Проходимость тестов"
              value={`${stats?.passRate ?? 0}%`}
              subtitle="успешно сдано"
              icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Заблокировано"
              value={stats?.blockedEmployees ?? 0}
              icon={<BlockIcon sx={{ fontSize: 28 }} />}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Завершено курсов"
              value={stats?.completedAssignments ?? 0}
              subtitle={`${(stats?.totalAssignments ?? 0) > 0 ? Math.round(((stats?.completedAssignments ?? 0) / (stats?.totalAssignments ?? 1)) * 100) : 0}%`}
              icon={<CheckIcon sx={{ fontSize: 28 }} />}
              color="success"
            />
          </Grid>
        </>
      )}

      {isManager && (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard
              title="Сотрудники подразделения"
              value={stats?.totalEmployees ?? 0}
              icon={<PeopleIcon sx={{ fontSize: 24 }} />}
              color="primary"
              onClick={() => navigate('/employees')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard
              title="Просрочки"
              value={stats?.overdueCount ?? 0}
              icon={<WarningIcon sx={{ fontSize: 28 }} />}
              color="error"
              onClick={() => navigate('/assignments')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <KpiCard
              title="Назначенные курсы"
              value={stats?.totalAssignments ?? 0}
              icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
              color="success"
              onClick={() => navigate('/assignments')}
            />
          </Grid>
        </>
      )}

      {isEmployee && (
        <>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <KpiCard
              title="Мои курсы"
              value={stats?.activeCourses ?? 0}
              subtitle={`${stats?.completedAssignments ?? 0} завершено`}
              icon={<SchoolIcon sx={{ fontSize: 28 }} />}
              color="primary"
              onClick={() => navigate('/courses')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <KpiCard
              title="Просроченные"
              value={stats?.overdueCount ?? 0}
              icon={<WarningIcon sx={{ fontSize: 28 }} />}
              color="error"
              onClick={() => navigate('/assignments')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <KpiCard
              title="Проходимость тестов"
              value={`${stats?.passRate ?? 0}%`}
              icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
              color="info"
              onClick={() => navigate('/tests')}
            />
          </Grid>
          {(stats?.blockedEmployees ?? 0) > 0 && (
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <KpiCard
                title="Статус"
                value="Заблокирован"
                icon={<BlockIcon sx={{ fontSize: 28 }} />}
                color="error"
              />
            </Grid>
          )}
        </>
      )}
    </Box>

    {/* === ПРОСРОЧКИ — ТОП-5 === */}
    {(isAdmin || isHr || isManager) && (stats?.overdueCount ?? 0) > 0 && (
      <Paper sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="error">
            ⚠️ Требуют внимания: {stats?.overdueCount ?? 0} просрочек
          </Typography>
          <Button endIcon={<ArrowIcon />} onClick={() => navigate('/assignments')} size="small">
            Все назначения
          </Button>
        </Box>
      </Paper>
    )}
    </Box>
  )
}