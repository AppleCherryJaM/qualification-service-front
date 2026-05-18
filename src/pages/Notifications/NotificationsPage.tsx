/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import {
  Box, Typography, Paper, Chip, IconButton, Tooltip, Button,
  Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import {
  MarkEmailRead as ReadIcon,
  DeleteOutline as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useNotifications, useMarkAsRead } from '../../hooks/useNotifications'
import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../utils/roles'
import type { Notification } from '../../types/api'

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = hasRole(user?.roles || [], ['admin', 'hr'])
  const employeeId = user?.employeeId

  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 25 })

  const filters = {
    ...(isAdmin ? {} : { employeeId: employeeId ?? undefined }),
    ...(showUnreadOnly ? { isRead: false } : {}),
  }

  const { data: notifications, isLoading, error } = useNotifications(filters)
  const markAsRead = useMarkAsRead()

  const columns: GridColDef<Notification>[] = [
    {
      field: 'status',
      headerName: '',
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: params.row.isRead ? 'grey.400' : 'primary.main',
          }}
        />
      ),
    },
    {
      field: 'message',
      headerName: 'Сообщение',
      width: 400,
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: params.row.isRead ? 'normal' : 'bold', whiteSpace: 'normal', wordBreak: 'break-word' }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'employee',
      headerName: 'Сотрудник',
      width: 180,
      valueGetter: (_value, row) => row.employee?.fullName || '—',
    },
    {
      field: 'createdAt',
      headerName: 'Дата',
      width: 160,
      valueGetter: (_value, row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleString('ru-RU') : '—',
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          {!params.row.isRead && (
            <Tooltip title="Отметить прочитанным">
              <IconButton
                size="small"
                color="primary"
                onClick={() => markAsRead.mutate(params.row.id)}
                disabled={markAsRead.isPending}
              >
                <ReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ]

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          Уведомления
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} непрочитанных`} color="error" size="small" sx={{ ml: 2 }} />
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Фильтр</InputLabel>
            <Select
              value={showUnreadOnly ? 'unread' : 'all'}
              label="Фильтр"
              onChange={(e) => setShowUnreadOnly(e.target.value === 'unread')}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="unread">Только непрочитанные</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as any)?.message || 'Ошибка загрузки'}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={notifications || []}
          columns={columns}
          loading={isLoading}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: 'Нет уведомлений',
            MuiTablePagination: { labelRowsPerPage: 'Строк на странице:' },
          }}
        />
      </Paper>
    </Box>
  )
}