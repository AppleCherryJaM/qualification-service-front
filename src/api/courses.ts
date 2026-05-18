import { apiClient } from './client'
import type { Course, CreateCourseDto, UpdateCourseDto } from '../types/api'

export const coursesApi = {
  getAll: () => apiClient.get<Course[]>('/courses'),
  getById: (id: number) => apiClient.get<Course>(`/courses/${id}`),
  create: (data: CreateCourseDto) => apiClient.post<Course>('/courses', data),
  update: (id: number, data: UpdateCourseDto) =>
    apiClient.patch<Course>(`/courses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/courses/${id}`),
}