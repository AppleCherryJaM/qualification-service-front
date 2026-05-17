import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid'
import { useEmployees, useDeleteEmployee } from '../../hooks/useEmployees'
import { useAuthStore } from '../../stores/authStore'
import { RoleGuard } from '../../components/RoleGuard/RoleGuard'
import { PERMISSIONS, hasRole } from '../../utils/roles'
import type { Employee } from '../../types/api'

export function EmployeesPage() {
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []
  const isManagerOnly = hasRole(userRoles, ['manager']) && !hasRole(userRoles, ['admin', 'hr'])

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'fullName', sort: 'asc' }])
  const [filters, setFilters] = useState<{ departmentId?: number; positionId?: number }>({})

  const { data: employees, isLoading, error } = useEmployees(isManagerOnly ? { departmentId: user?.employeeId } : filters)
  const deleteEmployee = useDeleteEmployee()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteEmployee.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      })
    }
  }

  const columns: GridColDef<Employee>[] = [
    { field: 'tabNumber', headerName: 'Таб. №', width: 100 },
    { field: 'fullName', headerName: 'ФИО', width: 250, flex: 1 },
    {
      field: 'department',
      headerName: 'Подразделение',
      width: 180,
      valueGetter: (_value, row) => row.department?.name || '—',
    },
    {
      field: 'position',
      headerName: 'Должность',
      width: 180,
      valueGetter: (_value, row) => row.position?.name || '—',
    },
    {
      field: 'hireDate',
      headerName: 'Дата приёма',
      width: 130,
      valueGetter: (_value, row) => {
        if (!row.hireDate) return '—'
        return new Date(row.hireDate).toLocaleDateString('ru-RU')
      },
    },
    {
      field: 'isBlocked',
      headerName: 'Статус',
      width: 140,
      renderCell: (params) => (
        params.value ? (
          <Chip icon={<BlockIcon />} label="Заблокирован" color="error" size="small" />
        ) : (
          <Chip icon={<CheckCircleIcon />} label="Активен" color="success" size="small" />
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Редактировать">
            <IconButton size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <RoleGuard allowedRoles={PERMISSIONS.EMPLOYEES_DELETE}>
            <Tooltip title="Удалить">
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteId(params.row.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </RoleGuard>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Сотрудники</Typography>
        <RoleGuard allowedRoles={PERMISSIONS.EMPLOYEES_CREATE}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Добавить
          </Button>
        </RoleGuard>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as any)?.message || 'Ошибка загрузки данных'}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={employees || []}
          columns={columns}
          loading={isLoading}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[5, 10, 25, 50]}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: 'Нет данных',
            MuiTablePagination: {
              labelRowsPerPage: 'Строк на странице:',
            },
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить сотрудника? Это действие необратимо.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteEmployee.isPending}>
            {deleteEmployee.isPending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
