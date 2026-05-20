import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Business,
  Work,
  Category,
} from '@mui/icons-material'
import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../utils/roles'

const DRAWER_WIDTH = 224

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: readonly string[]
}

const navItems: NavItem[] = [
  { label: 'Дашборд', path: '/', icon: <DashboardIcon />, roles: ['admin', 'hr', 'manager', 'employee'] },
  { label: 'Сотрудники', path: '/employees', icon: <PeopleIcon />, roles: ['admin', 'hr', 'manager'] },
  { label: 'Курсы', path: '/courses', icon: <SchoolIcon />, roles: ['admin', 'hr', 'manager', 'employee'] },
  { label: 'Назначения', path: '/assignments', icon: <AssignmentIcon />, roles: ['admin', 'hr', 'manager'] },
  { label: 'Подразделения', path: '/departments', icon: <Business />, roles: ['admin', 'hr'] },
  { label: 'Должности', path: '/positions', icon: <Work />, roles: ['admin', 'hr'] },
  { label: 'Виды обучения', path: '/training-types', icon: <Category />, roles: ['admin', 'hr'] },
  { label: 'Инструктажи', path: '/briefings', icon: <Work />, roles: ['admin', 'hr', 'manager'] },
  { label: 'Стажировки', path: '/internships', icon: <SchoolIcon />, roles: ['admin', 'hr', 'manager'] },
  { label: 'Тесты', path: '/tests', icon: <QuizIcon />, roles: ['admin', 'hr', 'manager', 'employee'] },
  { label: 'Отчёты', path: '/reports', icon: <AssessmentIcon />, roles: ['admin', 'hr', 'manager'] },
  { label: 'Настройки', path: '/settings', icon: <SettingsIcon />, roles: ['admin'] },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const userRoles = user?.roles || []
  const filteredNav = navItems.filter((item) => hasRole(userRoles, item.roles))

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          minHeight: 64,
        }}
      >
        <SchoolIcon sx={{ fontSize: 28, color: 'primary.contrastText' }} />
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            noWrap
            sx={{ lineHeight: 1.3 }}
          >
            Учёт Квалификации
          </Typography>
        </Box>
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{ ml: 'auto', p: 0.5 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider />
      
      <List sx={{ py: 1 }}>
        {filteredNav.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  )

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: (theme) => theme.zIndex.drawer + 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  )
}