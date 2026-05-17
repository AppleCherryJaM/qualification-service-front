import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../utils/roles'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material'
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'error' | 'success' | 'warning'
}

function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main`, fontSize: 40 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = hasRole(user?.roles || [], ['admin'])
  const isHr = hasRole(user?.roles || [], ['hr'])
  const isManager = hasRole(user?.roles || [], ['manager'])
  const isEmployee = hasRole(user?.roles || [], ['employee'])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Добро пожаловать, {user?.email}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {(isAdmin || isHr) && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                title="Всего сотрудников"
                value="—"
                icon={<PeopleIcon fontSize="inherit" />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                title="Активные курсы"
                value="—"
                icon={<SchoolIcon fontSize="inherit" />}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                title="Просрочки"
                value="—"
                icon={<WarningIcon fontSize="inherit" />}
                color="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard
                title="Проходимость тестов"
                value="—%"
                icon={<TrendingUpIcon fontSize="inherit" />}
                color="primary"
              />
            </Grid>
          </>
        )}

        {isManager && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <KpiCard
                title="Сотрудники подразделения"
                value="—"
                icon={<PeopleIcon fontSize="inherit" />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <KpiCard
                title="Просрочки в подразделении"
                value="—"
                icon={<WarningIcon fontSize="inherit" />}
                color="error"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <KpiCard
                title="Назначенные курсы"
                value="—"
                icon={<SchoolIcon fontSize="inherit" />}
                color="success"
              />
            </Grid>
          </>
        )}

        {isEmployee && (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <KpiCard
                title="Мои курсы"
                value="—"
                icon={<SchoolIcon fontSize="inherit" />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <KpiCard
                title="Просроченные"
                value="—"
                icon={<WarningIcon fontSize="inherit" />}
                color="error"
              />
            </Grid>
          </>
        )}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Быстрые действия
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь будут быстрые ссылки на частые операции (назначить курс, сформировать отчёт, пройти тест).
        </Typography>
      </Paper>
    </Box>
  )
}
