import { useState } from 'react'
import {
  Box, Typography, Button, Paper, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Alert,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { RoleGuard } from '../RoleGuard/RoleGuard'

interface ReferenceItem {
  id: number
  [key: string]: any
}

interface ReferencePageProps<T extends ReferenceItem> {
  title: string
  items: T[] | undefined
  isLoading: boolean
  error: any
  columns: GridColDef<T>[]
  formFields: {
    name: string
    label: string
    type?: 'text' | 'number'
    required?: boolean
  }[]
  onCreate: (data: Record<string, any>) => void
  onUpdate: (id: number, data: Record<string, any>) => void
  onDelete: (id: number) => void
  createPending: boolean
  updatePending: boolean
  deletePending: boolean
  allowedRoles: readonly string[]
}

export function ReferencePage<T extends ReferenceItem>({
  title,
  items,
  isLoading,
  error,
  columns,
  formFields,
  onCreate,
  onUpdate,
  onDelete,
  createPending,
  updatePending,
  deletePending,
  allowedRoles,
}: ReferencePageProps<T>) {
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const openCreate = () => {
    setEditingItem(null)
    setFormData({})
    setFormOpen(true)
  }

  const openEdit = (item: T) => {
    setEditingItem(item)
    setFormData(
      formFields.reduce((acc, field) => ({
        ...acc,
        [field.name]: item[field.name] ?? '',
      }), {})
    )
    setFormOpen(true)
  }

  const handleSubmit = () => {
    if (editingItem) {
      onUpdate(editingItem.id, formData)
    } else {
      onCreate(formData)
    }
    setFormOpen(false)
  }

  const actionColumn: GridColDef<T> = {
    field: 'actions',
    headerName: 'Действия',
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box>
        <Tooltip title="Редактировать">
          <IconButton size="small" color="primary" onClick={() => openEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <RoleGuard allowedRoles={allowedRoles}>
          <Tooltip title="Удалить">
            <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </RoleGuard>
      </Box>
    ),
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{title}</Typography>
        <RoleGuard allowedRoles={allowedRoles}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Добавить
          </Button>
        </RoleGuard>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as any)?.message || 'Ошибка загрузки'}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={items || []}
          columns={[...columns, actionColumn]}
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

      {/* Форма создания/редактирования */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Редактировать' : 'Добавить'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {formFields.map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              type={field.type || 'text'}
              value={formData[field.name] ?? ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              required={field.required !== false}
              fullWidth
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createPending || updatePending}
          >
            {createPending || updatePending ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Подтверждение удаления */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Удалить запись? Это действие необратимо.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button
            onClick={() => { onDelete(deleteId!); setDeleteId(null); }}
            color="error"
            disabled={deletePending}
          >
            {deletePending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}