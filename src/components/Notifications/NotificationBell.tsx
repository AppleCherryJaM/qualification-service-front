// src/components/Notifications/NotificationBell.tsx
import { useState } from 'react'
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box, Divider,
  Tooltip, ListItemIcon, ListItemText, CircularProgress,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as ReadIcon,
  Circle as CircleIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useMarkAsRead } from '../../hooks/useNotifications'
import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../utils/roles'
import { NotificationFilters } from '@/types/api';

export function NotificationBell() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const employeeId = user?.employeeId
  const isAdmin = hasRole(user?.roles || [], ['admin', 'hr'])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const filters = {
    ...(isAdmin || employeeId == null ? {} : { employeeId }),
  } as NotificationFilters;
  
  const { data: notifications, isLoading } = useNotifications(filters)
  const markAsRead = useMarkAsRead()

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0
  const recentNotifications = notifications?.slice(0, 5) || []

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead.mutate(id)
  }

  const handleGoToNotifications = () => {
    handleClose()
    navigate('/notifications')
  }

  return (
    <>
      <Tooltip title="Уведомления">
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Уведомления
          </Typography>
        </Box>
        <Divider />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : recentNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Нет уведомлений
            </Typography>
          </MenuItem>
        ) : (
          recentNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleGoToNotifications}
              sx={{
                bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                borderLeft: notification.isRead ? 'none' : '3px solid',
                borderLeftColor: 'primary.main',
              }}
            >
              <ListItemIcon>
                {notification.isRead ? (
                  <ReadIcon fontSize="small" color="disabled" />
                ) : (
                  <CircleIcon fontSize="small" color="primary" sx={{ fontSize: 12 }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: notification.isRead ? 'normal' : 'bold',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    {notification.message}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString('ru-RU')
                      : ''}
                  </Typography>
                }
              />
              {!notification.isRead && (
                <Tooltip title="Отметить прочитанным">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMarkRead(notification.id, e)}
                    disabled={markAsRead.isPending}
                  >
                    <ReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </MenuItem>
          ))
        )}

        <Divider />
        <MenuItem onClick={handleGoToNotifications}>
          <Typography variant="body2" color="primary" sx={{ width: '100%', textAlign: 'center' }}>
            Все уведомления
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}