import { useQuery, useMutation } from '@tanstack/react-query'
import { reportsApi } from '../api/reports'

export function useEmployeeCard(id: number) {
  return useQuery({
    queryKey: ['reports', 'employee-card', id],
    queryFn: () => reportsApi.getEmployeeCard(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useDebtors() {
  return useQuery({
    queryKey: ['reports', 'debtors'],
    queryFn: () => reportsApi.getDebtors().then((r) => r.data),
  })
}

export function useByDepartment(id: number) {
  return useQuery({
    queryKey: ['reports', 'by-department', id],
    queryFn: () => reportsApi.getByDepartment(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useBriefingJournal(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'briefing-journal', startDate, endDate],
    queryFn: () => reportsApi.getBriefingJournal(startDate, endDate).then((r) => r.data),
    enabled: !!startDate && !!endDate,
  })
}

export function useRegulatory() {
  return useQuery({
    queryKey: ['reports', 'regulatory'],
    queryFn: () => reportsApi.getRegulatory().then((r) => r.data),
  })
}

function downloadBlob(response: { data: Blob }, filename: string) {
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function useDownloadEmployeeCard() {
  return useMutation({
    mutationFn: (id: number) => reportsApi.downloadEmployeeCard(id),
    onSuccess: (_, id) => downloadBlob(_, `employee_card_${id}_${Date.now()}.xlsx`),
  })
}

export function useDownloadDebtors() {
  return useMutation({
    mutationFn: () => reportsApi.downloadDebtors(),
    onSuccess: (_) => downloadBlob(_, `debtors_${Date.now()}.xlsx`),
  })
}

export function useDownloadByDepartment() {
  return useMutation({
    mutationFn: (id: number) => reportsApi.downloadByDepartment(id),
    onSuccess: (_, id) => downloadBlob(_, `department_${id}_${Date.now()}.xlsx`),
  })
}

export function useDownloadBriefingJournal() {
  return useMutation({
    mutationFn: ({ startDate, endDate }: { startDate: string; endDate: string }) =>
      reportsApi.downloadBriefingJournal(startDate, endDate),
    onSuccess: (_) => downloadBlob(_, `briefing_journal_${Date.now()}.xlsx`),
  })
}

export function useDownloadRegulatory() {
  return useMutation({
    mutationFn: () => reportsApi.downloadRegulatory(),
    onSuccess: (_) => downloadBlob(_, `regulatory_${Date.now()}.xlsx`),
  })
}