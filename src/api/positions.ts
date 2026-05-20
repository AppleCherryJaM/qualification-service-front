import { apiClient } from './client'
import type { Position } from '../types/api'

export const positionsApi = {
  getAll: () => apiClient.get<Position[]>('/positions'),
  create: (data: Partial<Position>) => apiClient.post<Position>('/positions', data),
  update: (id: number, data: Partial<Position>) => apiClient.patch<Position>(`/positions/${id}`, data),
  delete: (id: number) => apiClient.delete(`/positions/${id}`),
}