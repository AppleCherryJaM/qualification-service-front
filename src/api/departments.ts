import { apiClient } from './client'
import type { Department } from '../types/api'

export const departmentsApi = {
  getAll: () => apiClient.get<Department[]>('/departments'),
  create: (data: Partial<Department>) => apiClient.post<Department>('/departments', data),
  update: (id: number, data: Partial<Department>) => apiClient.patch<Department>(`/departments/${id}`, data),
  delete: (id: number) => apiClient.delete(`/departments/${id}`),
}