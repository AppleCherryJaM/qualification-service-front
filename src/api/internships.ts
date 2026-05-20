import { apiClient } from './client'
import type { Internship } from '../types/api'

export interface InternshipFilters {
  employeeId?: number
  mentorId?: number
}

export const internshipsApi = {
  getAll: (filters?: InternshipFilters) =>
    apiClient.get<Internship[]>('/internships', { params: filters }),
  create: (data: Partial<Internship>) => apiClient.post<Internship>('/internships', data),
  delete: (id: number) => apiClient.delete(`/internships/${id}`),
}