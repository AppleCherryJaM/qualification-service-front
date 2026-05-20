// src/pages/Internships/InternshipsPage.tsx
import { useState } from 'react'
import {
  Box, Typography, Button, Paper, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Alert,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useInternships, useCreateInternship, useDeleteInternship } from '../../hooks/useInternships'
import { useEmployees } from '../../hooks/useEmployees'
import { RoleGuard } from '../../components/RoleGuard/RoleGuard'
import { PERMISSIONS } from '../../utils/roles'
import type { Internship } from '../../types/api'

export function InternshipsPage() {
  const { data: internships, isLoading, error } = useInternships()
  const { data: employees } = useEmployees()
  const create = useCreateInternship()
  const remove = useDeleteInternship()

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    shiftsCount: '',
    mentorId: '',
    passed: true,
  })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const columns: GridColDef<Internship>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'employee',
      headerName: 'Сотрудник',
      width: 220,
      valueGetter: (_v, r) => r.employee?.fullName || '—',
    },
    {
      field: 'startDate',
      headerName: 'Начало',
      width: 130,
      valueGetter: (_v, r) =>
        r.startDate ? new Date(r.startDate).toLocaleDateString('ru-RU') : '—',
    },
    {
      field: 'endDate',
      headerName: 'Окончание',
      width: 130,
      valueGetter: (_v, r) =>
        r.endDate ? new Date(r.endDate).toLocaleDateString('ru-RU') : '—',
    },
    {
      field: 'shiftsCount',
      headerName: 'Смен',
      width: 90,
    },
    {
      field: 'mentor',
      headerName: 'Наставник',
      width: 220,
      valueGetter: (_v, r) => r.mentor?.fullName || '—',
    },
    {
      field: 'passed',
      headerName: 'Результат',
      width: 130,
      valueGetter: (_v, r) => (r.passed ? 'Пройдена' : 'Не пройдена'),
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
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
      ),
    },
  ]

  const handleSubmit = () => {
    if (
      !formData.employeeId ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.shiftsCount
    )
      return

    create.mutate(
      {
        employeeId: parseInt(formData.employeeId),
        startDate: (new Date(formData.startDate)).toString(),
        endDate: (new Date(formData.endDate)).toString(),
        shiftsCount: parseInt(formData.shiftsCount),
        mentorId: formData.mentorId ? parseInt(formData.mentorId) : undefined,
        passed: formData.passed,
      },
      {
        onSuccess: () => {
          setFormOpen(false)
          setFormData({
            employeeId: '',
            startDate: '',
            endDate: '',
            shiftsCount: '',
            mentorId: '',
            passed: true,
          })
        },
      }
    )
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Стажировки</Typography>
        <RoleGuard allowedRoles={PERMISSIONS.EMPLOYEES_CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Записать стажировку
          </Button>
        </RoleGuard>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as any)?.message || 'Ошибка загрузки'}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={internships || []}
          columns={columns}
          loading={isLoading}
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          pageSizeOptions={[5, 10, 25, 50]}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: 'Нет данных',
            MuiTablePagination: { labelRowsPerPage: 'Строк на странице:' },
          }}
        />
      </Paper>

      {/* Модалка создания */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Запись стажировки</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <FormControl fullWidth required>
            <InputLabel>Сотрудник</InputLabel>
            <Select
              value={formData.employeeId}
              label="Сотрудник"
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
            >
              {employees?.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.fullName} ({e.tabNumber})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Дата начала"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Дата окончания"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Количество смен"
            type="number"
            value={formData.shiftsCount}
            onChange={(e) =>
              setFormData({ ...formData, shiftsCount: e.target.value })
            }
            required
            fullWidth
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth>
            <InputLabel>Наставник (необязательно)</InputLabel>
            <Select
              value={formData.mentorId}
              label="Наставник (необязательно)"
              onChange={(e) =>
                setFormData({ ...formData, mentorId: e.target.value })
              }
            >
              <MenuItem value="">—</MenuItem>
              {employees?.map((e) => (
                <MenuItem key={e.id} value={e.id}>
                  {e.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.passed}
                onChange={(e) =>
                  setFormData({ ...formData, passed: e.target.checked })
                }
              />
            }
            label={formData.passed ? 'Пройдена ✓' : 'Не пройдена ✗'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={create.isPending}
          >
            {create.isPending ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Удаление */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Удалить запись стажировки?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button
            onClick={() => {
              remove.mutate(deleteId!)
              setDeleteId(null)
            }}
            color="error"
            disabled={remove.isPending}
          >
            {remove.isPending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}