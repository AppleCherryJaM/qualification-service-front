import { apiClient } from './client'
import type { TrainingType } from '../types/api'

export const trainingTypesApi = {
  getAll: () => apiClient.get<TrainingType[]>('/training-types'),
  create: (data: Partial<TrainingType>) => apiClient.post<TrainingType>('/training-types', data),
  update: (id: number, data: Partial<TrainingType>) => apiClient.patch<TrainingType>(`/training-types/${id}`, data),
  delete: (id: number) => apiClient.delete(`/training-types/${id}`),
}