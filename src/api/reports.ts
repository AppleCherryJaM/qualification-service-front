import { apiClient } from './client'

export const reportsApi = {
  getEmployeeCard: (id: number) => apiClient.get(`/reports/employee-card/${id}`),
  getDebtors: () => apiClient.get('/reports/debtors'),
  getByDepartment: (id: number) => apiClient.get(`/reports/by-department/${id}`),
  getBriefingJournal: (startDate: string, endDate: string) =>
    apiClient.get('/reports/briefing-journal', { params: { startDate, endDate } }),
  getRegulatory: () => apiClient.get('/reports/regulatory'),

  downloadEmployeeCard: (id: number) =>
    apiClient.get(`/reports/employee-card/${id}/excel`, { responseType: 'blob' }),

  downloadDebtors: () =>
    apiClient.get('/reports/debtors/excel', { responseType: 'blob' }),

  downloadByDepartment: (id: number) =>
    apiClient.get(`/reports/by-department/${id}/excel`, { responseType: 'blob' }),

  downloadBriefingJournal: (startDate: string, endDate: string) =>
    apiClient.get('/reports/briefing-journal/excel', {
      params: { startDate, endDate },
      responseType: 'blob',
    }),

  downloadRegulatory: () =>
    apiClient.get('/reports/regulatory/excel', { responseType: 'blob' }),
}