import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
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
  { label: 'Тесты', path: '/tests', icon: <QuizIcon />, roles: ['admin', 'hr', 'manager', 'employee'] },
  { label: 'Отчёты', path: '/reports', icon: <AssessmentIcon />, roles: ['admin', 'hr'] },
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
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1 }}>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
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
