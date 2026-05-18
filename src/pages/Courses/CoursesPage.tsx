import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AssignmentInd as AssignmentIcon,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '../../hooks/useCourses'
import { useAssignCourse } from '../../hooks/useAssignments'
import { useEmployees } from '../../hooks/useEmployees'
import { RoleGuard } from '../../components/RoleGuard/RoleGuard'
import { PERMISSIONS } from '../../utils/roles'
import type { Course } from '../../types/api'

// === МОДАЛКА: СОЗДАНИЕ/РЕДАКТИРОВАНИЕ КУРСА ===
interface CourseFormData {
  name: string
  periodMonths: number
  trainingTypeId: number
}

function CourseFormModal({
  open,
  onClose,
  initialData,
  onSubmit,
  isPending,
}: {
  open: boolean
  onClose: () => void
  initialData?: Course
  onSubmit: (data: CourseFormData) => void
  isPending: boolean
}) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: initialData?.name || '',
    periodMonths: initialData?.periodMonths || 12,
    trainingTypeId: initialData?.trainingTypeId || 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Редактировать курс' : 'Новый курс'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Название курса"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Периодичность (месяцев)"
            type="number"
            value={formData.periodMonths}
            onChange={(e) => setFormData({ ...formData, periodMonths: parseInt(e.target.value) || 0 })}
            required
            fullWidth
            inputProps={{ min: 1 }}
          />
          <TextField
            label="ID вида обучения"
            type="number"
            value={formData.trainingTypeId}
            onChange={(e) => setFormData({ ...formData, trainingTypeId: parseInt(e.target.value) || 1 })}
            required
            fullWidth
            helperText="Временно: введите ID из справочника видов обучения"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

// === МОДАЛКА: НАЗНАЧЕНИЕ КУРСА СОТРУДНИКУ ===
function AssignModal({
  open,
  onClose,
  courseId,
}: {
  open: boolean
  onClose: () => void
  courseId: number | null
}) {
  const [employeeId, setEmployeeId] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const { data: employees } = useEmployees()
  const assign = useAssignCourse()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !employeeId || !plannedDate) return
    assign.mutate(
      {
        employeeId: parseInt(employeeId),
        courseId,
        plannedDate,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Назначить курс сотруднику</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {assign.isError && (
            <Alert severity="error">{(assign.error as any)?.response?.data?.message || 'Ошибка'}</Alert>
          )}
          <FormControl fullWidth required>
            <InputLabel>Сотрудник</InputLabel>
            <Select
              value={employeeId}
              label="Сотрудник"
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees?.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.tabNumber})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Плановая дата"
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={assign.isPending}>
            {assign.isPending ? <CircularProgress size={20} /> : 'Назначить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

// === ГЛАВНАЯ СТРАНИЦА ===
export function CoursesPage() {
  const { data: courses, isLoading, error } = useCourses()
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [formOpen, setFormOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>()
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignCourseId, setAssignCourseId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleCreate = (data: CourseFormData) => {
    createCourse.mutate(data, { onSuccess: () => setFormOpen(false) })
  }

  const handleUpdate = (data: CourseFormData) => {
    if (!editingCourse) return
    updateCourse.mutate(
      { id: editingCourse.id, data },
      { onSuccess: () => { setFormOpen(false); setEditingCourse(undefined); } }
    )
  }

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteCourse.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
    }
  }

  const openEdit = (course: Course) => {
    setEditingCourse(course)
    setFormOpen(true)
  }

  const openCreate = () => {
    setEditingCourse(undefined)
    setFormOpen(true)
  }

  const openAssign = (courseId: number) => {
    setAssignCourseId(courseId)
    setAssignOpen(true)
  }

  const columns: GridColDef<Course>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Название курса', width: 300, flex: 1 },
    {
      field: 'trainingType',
      headerName: 'Вид обучения',
      width: 180,
      valueGetter: (_value, row) => row.trainingType?.name || '—',
    },
    {
      field: 'periodMonths',
      headerName: 'Периодичность',
      width: 130,
      valueGetter: (_value, row) => `${row.periodMonths} мес.`,
    },
    {
      field: 'testsCount',
      headerName: 'Тесты',
      width: 100,
      valueGetter: (_value, row) => row.tests?.length || 0,
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Назначить сотруднику">
            <IconButton size="small" color="primary" onClick={() => openAssign(params.row.id)}>
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <RoleGuard allowedRoles={PERMISSIONS.COURSES_UPDATE}>
            <Tooltip title="Редактировать">
              <IconButton size="small" color="primary" onClick={() => openEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </RoleGuard>
          <RoleGuard allowedRoles={PERMISSIONS.COURSES_DELETE}>
            <Tooltip title="Удалить">
              <IconButton size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
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
        <Typography variant="h4">Курсы</Typography>
        <RoleGuard allowedRoles={PERMISSIONS.COURSES_CREATE}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Добавить курс
          </Button>
        </RoleGuard>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as any)?.message || 'Ошибка загрузки курсов'}
        </Alert>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={courses || []}
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

      <CourseFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingCourse(undefined); }}
        initialData={editingCourse}
        onSubmit={editingCourse ? handleUpdate : handleCreate}
        isPending={createCourse.isPending || updateCourse.isPending}
      />

      <AssignModal
        open={assignOpen}
        onClose={() => { setAssignOpen(false); setAssignCourseId(null); }}
        courseId={assignCourseId}
      />

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Удалить курс? Это действие необратимо.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteCourse.isPending}>
            {deleteCourse.isPending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}