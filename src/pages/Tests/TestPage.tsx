// src/pages/Tests/TestsPage.tsx
import { useState } from 'react'
import {
  Box, Typography, Button, Paper, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Radio, Checkbox, FormControlLabel,
  FormGroup, Card, CardContent,
} from '@mui/material'
import {
  Add as AddIcon, Delete as DeleteIcon, PlayArrow as PlayIcon,
  CheckCircle as CheckIcon, Cancel as CancelIcon,
} from '@mui/icons-material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useTests, useTest, useDeleteTest, useTestResults, useSubmitTest, useCreateTest } from '../../hooks/useTests'
import { useAuthStore } from '../../stores/authStore'
import { RoleGuard } from '../../components/RoleGuard/RoleGuard'
import { PERMISSIONS, hasRole } from '../../utils/roles'
import type { Test, SubmitAnswerDto } from '../../types/api'

// === МОДАЛКА: ПРОХОЖДЕНИЕ ТЕСТА ===
function TakeTestModal({
  open, onClose, testId, employeeId,
}: {
  open: boolean; onClose: () => void; testId: number | null; employeeId: number
}) {
  const { data: test, isLoading } = useTest(testId || 0)
  const submit = useSubmitTest()
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null)

  if (!open || !testId) return null

  const handleAnswer = (questionId: number, answerId: number, type: 'single' | 'multiple') => {
    setAnswers((prev) => {
      if (type === 'single') {
        return { ...prev, [questionId]: [answerId] }
      }
      const current = prev[questionId] || []
      const exists = current.includes(answerId)
      const updated = exists ? current.filter((id) => id !== answerId) : [...current, answerId]
      return { ...prev, [questionId]: updated }
    })
  }

  const allAnswered = () => {
    if (!test?.questions || test.questions.length === 0) return false
    return test.questions.every((q) => (answers[q.id]?.length || 0) > 0)
  }

  const handleSubmit = () => {
    if (!test || !testId) return
    if (!test.questions || test.questions.length === 0) return
    if (!allAnswered()) return

    const submitData: { employeeId: number; answers: SubmitAnswerDto[] } = {
      employeeId,
      answers: Object.entries(answers).flatMap(([qId, aIds]) =>
        aIds.map((aId) => ({ questionId: parseInt(qId), answerId: aId }))
      ),
    }

    submit.mutate({ id: testId, data: submitData }, {
      onSuccess: (data) => setResult(data),
    })
  }

  const handleClose = () => {
    setAnswers({})
    setResult(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle>
        {result ? 'Результат теста' : (test?.title || 'Тест')}
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : result ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h2" color={result.passed ? 'success.main' : 'error.main'} gutterBottom>
              {result.score}%
            </Typography>
            <Chip
              icon={result.passed ? <CheckIcon /> : <CancelIcon />}
              label={result.passed ? 'Тест пройден ✓' : 'Тест не пройден ✗'}
              color={result.passed ? 'success' : 'error'}
              sx={{ fontSize: '1.2rem', py: 1, px: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Проходной балл: {test?.passingScore ?? 70}%
            </Typography>
            <Button variant="contained" onClick={handleClose} sx={{ mt: 3 }}>
              Закрыть
            </Button>
          </Box>
        ) : !test?.questions || test.questions.length === 0 ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            В тесте пока нет вопросов
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {test.questions.map((q, idx) => (
              <Card key={q.id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Вопрос {idx + 1}. {q.text}
                  </Typography>
                  {!q.answers || q.answers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Нет вариантов ответа
                    </Typography>
                  ) : (
                    <FormGroup>
                      {q.answers.map((a) => (
                        <FormControlLabel
                          key={a.id}
                          control={
                            q.type === 'single' ? (
                              <Radio
                                checked={(answers[q.id] || []).includes(a.id)}
                                onChange={() => handleAnswer(q.id, a.id, 'single')}
                              />
                            ) : (
                              <Checkbox
                                checked={(answers[q.id] || []).includes(a.id)}
                                onChange={() => handleAnswer(q.id, a.id, 'multiple')}
                              />
                            )
                          }
                          label={a.text}
                        />
                      ))}
                    </FormGroup>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      {!result && (
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submit.isPending || !allAnswered()}
          >
            {submit.isPending ? <CircularProgress size={20} /> : 'Завершить тест'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

// === МОДАЛКА: СОЗДАНИЕ ТЕСТА ===
function CreateTestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateTest()
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [passingScore, setPassingScore] = useState(70)

  const handleSubmit = () => {
    if (!title || !courseId) return
    create.mutate({
      title,
      courseId: parseInt(courseId),
      passingScore,
      questions: [],
    }, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Новый тест</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField label="Название" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
        <TextField label="ID курса" type="number" value={courseId} onChange={(e) => setCourseId(e.target.value)} required fullWidth />
        <TextField label="Проходной балл" type="number" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)} fullWidth inputProps={{ min: 0, max: 100 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={create.isPending}>
          {create.isPending ? <CircularProgress size={20} /> : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// === ГЛАВНАЯ СТРАНИЦА ===
export function TestsPage() {
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []
  const isEmployee = hasRole(userRoles, ['employee']) && !hasRole(userRoles, ['admin', 'hr', 'manager'])
  const employeeId = user?.employeeId

  const { data: tests, isLoading, error } = useTests()
  const { data: results } = useTestResults(isEmployee && employeeId ? { employeeId } : undefined)
  const deleteTest = useDeleteTest()

  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [takeOpen, setTakeOpen] = useState(false)
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const myResults = (testId: number) =>
    results?.filter((r) => r.testId === testId) || []

  const columns: GridColDef<Test>[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Название', width: 300, flex: 1 },
    {
      field: 'course',
      headerName: 'Курс',
      width: 200,
      valueGetter: (_value, row) => row.course?.name || '—',
    },
    {
      field: 'passingScore',
      headerName: 'Проходной балл',
      width: 130,
      valueGetter: (_value, row) => `${row.passingScore ?? 70}%`,
    },
    {
      field: 'questions',
      headerName: 'Вопросов',
      width: 100,
      valueGetter: (_value, row) => row.questions?.length ?? 0,
    },
    {
      field: 'myResults',
      headerName: 'Мои попытки',
      width: 130,
      renderCell: (params) => {
        const res = myResults(params.row.id)
        if (res.length === 0) return <Typography variant="body2" color="text.secondary">—</Typography>
        return (
          <Box>
            {res.map((r) => (
              <Chip
                key={r.id}
                size="small"
                label={`${r.score}%`}
                color={r.passed ? 'success' : 'error'}
                sx={{ mr: 0.5 }}
              />
            ))}
          </Box>
        )
      },
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          {employeeId && (
            <Tooltip title="Пройти тест">
              <IconButton
                size="small"
                color="primary"
                onClick={() => { setSelectedTestId(params.row.id); setTakeOpen(true); }}
              >
                <PlayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <RoleGuard allowedRoles={PERMISSIONS.TESTS_CREATE}>
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
        <Typography variant="h4">Тесты</Typography>
        <RoleGuard allowedRoles={PERMISSIONS.TESTS_CREATE}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Создать тест
          </Button>
        </RoleGuard>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{(error as any)?.message || 'Ошибка загрузки'}</Alert>}

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={tests || []}
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

      <TakeTestModal
        open={takeOpen}
        onClose={() => { setTakeOpen(false); setSelectedTestId(null); }}
        testId={selectedTestId}
        employeeId={employeeId || 0}
      />

      <CreateTestModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Удалить тест? Все результаты сохранятся.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button
            onClick={() => { deleteTest.mutate(deleteId!); setDeleteId(null); }}
            color="error"
            disabled={deleteTest.isPending}
          >
            {deleteTest.isPending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}