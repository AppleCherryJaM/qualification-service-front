import { apiClient } from './client'
import type { Briefing } from '../types/api'

export interface BriefingFilters {
  employeeId?: number
  instructorId?: number
  type?: string
}

export const briefingsApi = {
  getAll: (filters?: BriefingFilters) =>
    apiClient.get<Briefing[]>('/briefings', { params: filters }),
  create: (data: Partial<Briefing>) => apiClient.post<Briefing>('/briefings', data),
  delete: (id: number) => apiClient.delete(`/briefings/${id}`),
}