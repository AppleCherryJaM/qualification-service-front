import { useState } from 'react'
import {
  Box, Typography, Button, Paper, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, FormControlLabel, Switch,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon, Delete as DeleteIcon,
  Warning as WarningIcon, PlayArrow as PlayArrowIcon,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import {
  useAssignments, useCompleteAssignment, useDeleteAssignment, useCheckOverdue,
} from '../../hooks/useAssignments'
import { useAuthStore } from '../../stores/authStore'
import { PERMISSIONS, hasRole } from '../../utils/roles'
import type { CourseAssignment, AssignmentStatus } from '../../types/api'

// === МОДАЛКА: ОТМЕТИТЬ ПРОХОЖДЕНИЕ ===
function CompleteModal({ open, onClose, assignment }: {
  open: boolean; onClose: () => void; assignment: CourseAssignment | null
}) {
  const [factDate, setFactDate] = useState(new Date().toISOString().split('T')[0])
  const [passed, setPassed] = useState(true)
  const complete = useCompleteAssignment()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment) return
    complete.mutate({ id: assignment.id, data: { factDate, passed } }, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Отметить прохождение: {assignment?.course?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {complete.isError && (
            <Alert severity="error">{(complete.error as any)?.response?.data?.message || 'Ошибка'}</Alert>
          )}
          <Typography variant="body2" color="text.secondary">
            Сотрудник: {assignment?.employee?.fullName}
          </Typography>
          <TextField label="Фактическая дата" type="date" value={factDate}
            onChange={(e) => setFactDate(e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
          <FormControlLabel control={
            <Switch checked={passed} onChange={(e) => setPassed(e.target.checked)} />
          } label={passed ? 'Сдал ✓' : 'Не сдал ✗'} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={complete.isPending}>
            {complete.isPending ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

// === ГЛАВНАЯ СТРАНИЦА ===
export function AssignmentsPage() {
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []
  const canComplete = hasRole(userRoles, PERMISSIONS.ASSIGNMENTS_COMPLETE)
  const canCheckOverdue = hasRole(userRoles, PERMISSIONS.ASSIGNMENTS_CHECK_OVERDUE)
  const canDelete = hasRole(userRoles, ['admin'])

  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('')
  const [showOverdue, setShowOverdue] = useState(false)

  const filters = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(showOverdue ? { overdue: true } : {}),
  }

  const { data: assignments, isLoading, error } = useAssignments(filters)
  const deleteAssignment = useDeleteAssignment()
  const checkOverdue = useCheckOverdue()

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [completeOpen, setCompleteOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleComplete = (assignment: CourseAssignment) => {
    setSelectedAssignment(assignment)
    setCompleteOpen(true)
  }

  const handleDelete = () => {
    if (deleteId !== null) deleteAssignment.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  const getStatusChip = (status: AssignmentStatus) => {
    switch (status) {
      case 'planned': return <Chip size="small" label="Запланировано" color="info" />
      case 'in_progress': return <Chip size="small" label="В процессе" color="warning" />
      case 'completed': return <Chip size="small" label="Завершено" color="success" icon={<CheckCircleIcon />} />
      case 'overdue': return <Chip size="small" label="Просрочено" color="error" icon={<WarningIcon />} />
      default: return <Chip size="small" label={status} />
    }
  }

  const columns: GridColDef<CourseAssignment>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'employee', headerName: 'Сотрудник', width: 220,
      valueGetter: (_value, row) => row.employee?.fullName || '—' },
    { field: 'course', headerName: 'Курс', width: 250, flex: 1,
      valueGetter: (_value, row) => row.course?.name || '—' },
    { field: 'plannedDate', headerName: 'Плановая дата', width: 130,
      valueGetter: (_value, row) => row.plannedDate ? new Date(row.plannedDate).toLocaleDateString('ru-RU') : '—' },
    { field: 'factDate', headerName: 'Факт. дата', width: 130,
      valueGetter: (_value, row) => row.factDate ? new Date(row.factDate).toLocaleDateString('ru-RU') : '—' },
    { field: 'status', headerName: 'Статус', width: 140,
      renderCell: (params) => getStatusChip(params.value as AssignmentStatus) },
    { field: 'passed', headerName: 'Результат', width: 100,
      valueGetter: (_value, row) => row.status !== 'completed' ? '—' : row.passed ? 'Сдал' : 'Не сдал' },
    { field: 'actions', headerName: 'Действия', width: 180, sortable: false, filterable: false,
      renderCell: (params) => (
        <Box>
          {params.row.status !== 'completed' && canComplete && (
            <Tooltip title="Отметить прохождение">
              <IconButton size="small" color="success" onClick={() => handleComplete(params.row)}>
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Удалить">
              <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">Назначения курсов</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {canCheckOverdue && (
            <Button variant="outlined" color="warning" startIcon={<PlayArrowIcon />}
              onClick={() => checkOverdue.mutate()} disabled={checkOverdue.isPending}>
              {checkOverdue.isPending ? <CircularProgress size={20} /> : 'Проверить просрочки'}
            </Button>
          )}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Статус</InputLabel>
            <Select value={statusFilter} label="Статус"
              onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | '')}>
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="planned">Запланировано</MenuItem>
              <MenuItem value="in_progress">В процессе</MenuItem>
              <MenuItem value="completed">Завершено</MenuItem>
              <MenuItem value="overdue">Просрочено</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={
            <Switch checked={showOverdue} onChange={(e) => setShowOverdue(e.target.checked)} />
          } label="Только просрочки" />
        </Box>
      </Box>

      {checkOverdue.isSuccess && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Проверка завершена. Обновлено записей: {checkOverdue.data?.updated || 0}
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as any)?.message || 'Ошибка загрузки'}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid rows={assignments || []} columns={columns}
          loading={isLoading || checkOverdue.isPending}
          paginationModel={pagination} onPaginationModelChange={setPagination}
          pageSizeOptions={[5, 10, 25, 50]} disableRowSelectionOnClick
          localeText={{ noRowsLabel: 'Нет данных', MuiTablePagination: { labelRowsPerPage: 'Строк на странице:' } }} />
      </Paper>

      <CompleteModal open={completeOpen}
        onClose={() => { setCompleteOpen(false); setSelectedAssignment(null); }}
        assignment={selectedAssignment} />

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent><Typography>Удалить назначение? Это действие необратимо.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteAssignment.isPending}>
            {deleteAssignment.isPending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}