import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Menu, MenuItem } from '@mui/material'
import { Notifications as NotificationsIcon, AccountCircle, Logout as LogoutIcon } from '@mui/icons-material'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useLogout } from '../../hooks/useAuth'

export function AppHeader() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: { md: `calc(100% - 224px)` },
        ml: { md: '224px' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ИС Учёт повышения квалификации
        </Typography>

        <IconButton color="inherit">
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {user?.email}
          </Typography>
          <IconButton
            size="large"
            color="inherit"
            onClick={handleMenu}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              Роли: {user?.roles?.join(', ') || '—'}
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); logout(); }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Выйти
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
