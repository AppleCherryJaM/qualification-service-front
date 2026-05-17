import { apiClient } from './client'
import type { Employee, WorkAllowanceResponse } from '../types/api'

export interface EmployeeFilters {
  departmentId?: number
  positionId?: number
}

export const employeesApi = {
  getAll: (filters?: EmployeeFilters) =>
    apiClient.get<Employee[]>('/employees', { params: filters }),

  getById: (id: number) =>
    apiClient.get<Employee>(`/employees/${id}`),

  getAllowance: (id: number) =>
    apiClient.get<WorkAllowanceResponse>(`/employees/${id}/allowance`),

  create: (data: Partial<Employee>) =>
    apiClient.post<Employee>('/employees', data),

  update: (id: number, data: Partial<Employee>) =>
    apiClient.patch<Employee>(`/employees/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/employees/${id}`),
}
