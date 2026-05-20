/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Tabs, Tab, Button, TextField,
  CircularProgress, Card, CardContent, Grid, Divider,
} from '@mui/material'
import {
  Download as DownloadIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Book as BookIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import {
  useEmployeeCard, useDebtors, useByDepartment, useBriefingJournal, useRegulatory,
  useDownloadEmployeeCard, useDownloadDebtors, useDownloadByDepartment,
  useDownloadBriefingJournal, useDownloadRegulatory,
} from '../../hooks/useReports'
import { useDepartments } from '../../hooks/useDepartments'
import { useEmployee } from '../../hooks/useEmployees'
import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../utils/roles'

interface TabPanelProps { children: React.ReactNode; value: number; index: number }

function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null
}

export function ReportsPage() {
  const user = useAuthStore((s) => s.user)
  const userRoles = user?.roles || []

  const isAdmin = hasRole(userRoles, ['admin'])
  const isHr = hasRole(userRoles, ['hr'])
  const isManager = hasRole(userRoles, ['manager']) && !isAdmin && !isHr

  // === ВИДИМЫЕ ТАБЫ ===
  const visibleTabs = isManager
    ? [{ index: 2, icon: <BusinessIcon />, label: 'По отделу' }]
    : [
        { index: 0, icon: <PeopleIcon />, label: 'Карточка сотрудника' },
        { index: 1, icon: <WarningIcon />, label: 'Должники' },
        { index: 2, icon: <BusinessIcon />, label: 'По отделу' },
        { index: 3, icon: <BookIcon />, label: 'Журнал инструктажей' },
        { index: 4, icon: <VerifiedIcon />, label: 'Регламентный' },
      ]

  const [tab, setTab] = useState(isManager ? 2 : 0)
  const effectiveTab = isManager ? 2 : tab

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (!isManager) setTab(newValue)
  }

  // === ДАННЫЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (для менеджера) ===
  const { data: currentEmployee } = useEmployee(user?.employeeId ?? 0)
  const managerDeptId = isManager ? currentEmployee?.departmentId : undefined

  // === СПРАВОЧНИКИ ===
  const { data: departments } = useDepartments()

  // === Employee Card ===
  const [cardId, setCardId] = useState('')
  const { data: cardData, isLoading: cardLoading } = useEmployeeCard(parseInt(cardId) || 0)
  const downloadCard = useDownloadEmployeeCard()

  // === Debtors ===
  const { data: debtors, isLoading: debtorsLoading } = useDebtors()
  const downloadDebtors = useDownloadDebtors()

  // === By Department ===
  const [deptId, setDeptId] = useState('')
  const { data: deptData, isLoading: deptLoading } = useByDepartment(
    parseInt(deptId) || managerDeptId || 0
  )
  const downloadDept = useDownloadByDepartment()

  // Автовыбор отдела для менеджера
  useEffect(() => {
    if (isManager && managerDeptId && !deptId) {
      setDeptId(String(managerDeptId))
    }
  }, [isManager, managerDeptId, deptId])

  // === Briefing Journal ===
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { data: briefings, isLoading: briefLoading } = useBriefingJournal(startDate, endDate)
  const downloadBriefings = useDownloadBriefingJournal()

  // === Regulatory ===
  const { data: regulatory, isLoading: regLoading } = useRegulatory()
  const downloadRegulatory = useDownloadRegulatory()

  // === КОЛОНКИ ===
  const debtorsColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'ФИО', width: 200 },
    { field: 'tabNumber', headerName: 'Таб. №', width: 100 },
    { field: 'department', headerName: 'Отдел', width: 150 },
    { field: 'overdueCount', headerName: 'Просрочки', width: 100 },
  ]

  const deptColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'ФИО', width: 200 },
    { field: 'tabNumber', headerName: 'Таб. №', width: 100 },
    { field: 'position', headerName: 'Должность', width: 150 },
    { field: 'totalCourses', headerName: 'Всего курсов', width: 120 },
    { field: 'completedCourses', headerName: 'Пройдено', width: 100 },
    { field: 'overdueCount', headerName: 'Просрочки', width: 100 },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Отчёты</Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={effectiveTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((t) => (
            <Tab key={t.index} icon={t.icon} label={t.label} />
          ))}
        </Tabs>
      </Paper>

      {/* === КАРТОЧКА СОТРУДНИКА (только admin/hr) === */}
      {!isManager && (
        <TabPanel value={effectiveTab} index={0}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <TextField
                label="ID сотрудника"
                type="number"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => cardId && downloadCard.mutate(parseInt(cardId))}
                disabled={!cardId || downloadCard.isPending}
              >
                {downloadCard.isPending ? <CircularProgress size={20} /> : 'Скачать Excel'}
              </Button>
            </Box>

            {cardLoading ? <CircularProgress /> : cardData && (
              <Card>
                <CardContent>
                  <Typography variant="h6">{cardData.fullName}</Typography>
                  <Typography color="text.secondary">Таб. №: {cardData.tabNumber}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Отдел: {cardData.department?.name || '—'}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Должность: {cardData.position?.name || '—'}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Курсов: {cardData.courseAssignments?.length || 0}</Typography></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><Typography variant="body2">Просрочек: {cardData.courseAssignments?.filter((c: any) => c.status === 'OVERDUE').length || 0}</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Paper>
        </TabPanel>
      )}

      {/* === ДОЛЖНИКИ (только admin/hr) === */}
      {!isManager && (
        <TabPanel value={effectiveTab} index={1}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Список должников</Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => downloadDebtors.mutate()}
                disabled={downloadDebtors.isPending}
              >
                {downloadDebtors.isPending ? <CircularProgress size={20} /> : 'Excel'}
              </Button>
            </Box>
            <DataGrid
              rows={debtors || []}
              columns={debtorsColumns}
              loading={debtorsLoading}
              pageSizeOptions={[10, 25, 50]}
              autoHeight
              disableRowSelectionOnClick
            />
          </Paper>
        </TabPanel>
      )}

      {/* === ПО ОТДЕЛУ (все роли) === */}
      <TabPanel value={effectiveTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <TextField
              select
              label="Отдел"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              SelectProps={{ native: true }}
              disabled={isManager}
            >
              <option value="">Выберите отдел</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => deptId && downloadDept.mutate(parseInt(deptId))}
              disabled={!deptId || downloadDept.isPending}
            >
              {downloadDept.isPending ? <CircularProgress size={20} /> : 'Excel'}
            </Button>
          </Box>
          <DataGrid
            rows={deptData || []}
            columns={deptColumns}
            loading={deptLoading}
            pageSizeOptions={[10, 25, 50]}
            autoHeight
            disableRowSelectionOnClick
          />
        </Paper>
      </TabPanel>

      {/* === ЖУРНАЛ ИНСТРУКТАЖЕЙ (только admin/hr) === */}
      {!isManager && (
        <TabPanel value={effectiveTab} index={3}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <TextField
                label="С"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="По"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => startDate && endDate && downloadBriefings.mutate({ startDate, endDate })}
                disabled={!startDate || !endDate || downloadBriefings.isPending}
              >
                {downloadBriefings.isPending ? <CircularProgress size={20} /> : 'Excel'}
              </Button>
            </Box>
            {briefings && (
              <DataGrid
                rows={briefings}
                columns={[
                  { field: 'id', headerName: 'ID', width: 70 },
                  { field: 'employee', headerName: 'Сотрудник', width: 200, valueGetter: (_v, r) => r.employee?.fullName || '—' },
                  { field: 'type', headerName: 'Тип', width: 150 },
                  { field: 'date', headerName: 'Дата', width: 130, valueGetter: (_v, r) => r.date ? new Date(r.date).toLocaleDateString('ru-RU') : '—' },
                ]}
                loading={briefLoading}
                autoHeight
                disableRowSelectionOnClick
              />
            )}
          </Paper>
        </TabPanel>
      )}

      {/* === РЕГЛАМЕНТНЫЙ (только admin/hr) === */}
      {!isManager && (
        <TabPanel value={effectiveTab} index={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Регламентный отчёт</Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => downloadRegulatory.mutate()}
                disabled={downloadRegulatory.isPending}
              >
                {downloadRegulatory.isPending ? <CircularProgress size={20} /> : 'Excel'}
              </Button>
            </Box>
            {regulatory && (
              <DataGrid
                rows={regulatory}
                columns={[
                  { field: 'id', headerName: 'ID', width: 70 },
                  { field: 'employee', headerName: 'Сотрудник', width: 200, valueGetter: (_v, r) => r.employee?.fullName || '—' },
                  { field: 'course', headerName: 'Курс', width: 200, valueGetter: (_v, r) => r.course?.name || '—' },
                  { field: 'factDate', headerName: 'Дата прохождения', width: 150, valueGetter: (_v, r) => r.factDate ? new Date(r.factDate).toLocaleDateString('ru-RU') : '—' },
                ]}
                loading={regLoading}
                autoHeight
                disableRowSelectionOnClick
              />
            )}
          </Paper>
        </TabPanel>
      )}
    </Box>
  )
}