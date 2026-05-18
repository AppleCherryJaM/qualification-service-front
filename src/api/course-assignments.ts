import { apiClient } from './client'
import type {
  CourseAssignment,
  CreateAssignmentDto,
  CompleteAssignmentDto,
  AssignmentFilters,
} from '../types/api'

export const assignmentsApi = {
  getAll: (filters?: AssignmentFilters) =>
    apiClient.get<CourseAssignment[]>('/course-assignments', { params: filters }),

  getById: (id: number) =>
    apiClient.get<CourseAssignment>(`/course-assignments/${id}`),

  create: (data: Partial<CourseAssignment>) =>
    apiClient.post<CourseAssignment>('/course-assignments', data),

  assign: (data: CreateAssignmentDto) =>
    apiClient.post<CourseAssignment>('/course-assignments/assign', data),

  complete: (id: number, data: CompleteAssignmentDto) =>
    apiClient.post<CourseAssignment>(`/course-assignments/${id}/complete`, data),

  update: (id: number, data: Partial<CourseAssignment>) =>
    apiClient.patch<CourseAssignment>(`/course-assignments/${id}`, data),

  delete: (id: number) => apiClient.delete(`/course-assignments/${id}`),

  checkOverdue: () => apiClient.post('/course-assignments/check-overdue'),
}