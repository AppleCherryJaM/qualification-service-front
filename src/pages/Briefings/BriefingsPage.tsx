// src/pages/Briefings/BriefingsPage.tsx
import { useState } from 'react'
import {
  Box, Typography, Button, Paper, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useBriefings, useCreateBriefing, useDeleteBriefing } from '../../hooks/useBriefings'
import { useEmployees } from '../../hooks/useEmployees'
import { RoleGuard } from '../../components/RoleGuard/RoleGuard'
import { PERMISSIONS } from '../../utils/roles'
import type { Briefing } from '../../types/api'

const BRIEFING_TYPES = [
  { value: 'introductory', label: 'Вводный' },
  { value: 'initial', label: 'Первичный' },
  { value: 'repeated', label: 'Повторный' },
  { value: 'unplanned', label: 'Внеплановый' },
  { value: 'targeted', label: 'Целевой' },
]

export function BriefingsPage() {
  const { data: briefings, isLoading, error } = useBriefings()
  const { data: employees } = useEmployees()
  const create = useCreateBriefing()
  const remove = useDeleteBriefing()

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    type: '',
    date: '',
    instructorId: '',
  })
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const columns: GridColDef<Briefing>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'employee',
      headerName: 'Сотрудник',
      width: 220,
      valueGetter: (_v, r) => r.employee?.fullName || '—',
    },
    {
      field: 'type',
      headerName: 'Тип',
      width: 150,
      valueGetter: (_v, r) => {
        const t = BRIEFING_TYPES.find((x) => x.value === r.type)
        return t?.label || r.type
      },
    },
    {
      field: 'date',
      headerName: 'Дата',
      width: 130,
      valueGetter: (_v, r) =>
        r.date ? new Date(r.date).toLocaleDateString('ru-RU') : '—',
    },
    {
      field: 'instructor',
      headerName: 'Инструктор',
      width: 220,
      valueGetter: (_v, r) => r.instructor?.fullName || '—',
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
    if (!formData.employeeId || !formData.type || !formData.date) return

    create.mutate(
      {
        employeeId: parseInt(formData.employeeId),
        type: formData.type,
        date: (new Date(formData.date)).toString(),
        instructorId: formData.instructorId
          ? parseInt(formData.instructorId)
          : undefined,
      },
      {
        onSuccess: () => {
          setFormOpen(false)
          setFormData({ employeeId: '', type: '', date: '', instructorId: '' })
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
        <Typography variant="h4">Инструктажи</Typography>
        <RoleGuard allowedRoles={PERMISSIONS.EMPLOYEES_CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Записать инструктаж
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
          rows={briefings || []}
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
        <DialogTitle>Запись инструктажа</DialogTitle>
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

          <FormControl fullWidth required>
            <InputLabel>Тип инструктажа</InputLabel>
            <Select
              value={formData.type}
              label="Тип инструктажа"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              {BRIEFING_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Дата"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Инструктор (необязательно)</InputLabel>
            <Select
              value={formData.instructorId}
              label="Инструктор (необязательно)"
              onChange={(e) =>
                setFormData({ ...formData, instructorId: e.target.value })
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
          <Typography>Удалить запись инструктажа?</Typography>
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