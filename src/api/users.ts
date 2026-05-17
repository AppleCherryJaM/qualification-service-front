import { apiClient } from './client'
import type { User, CreateUserDto, UpdateUserDto, RegisterEmployeeDto } from '../types/api'

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getMe: () => apiClient.get<User>('/users/me'),
  getById: (id: number) => apiClient.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => apiClient.post<User>('/users', data),
  registerEmployee: (data: RegisterEmployeeDto) =>
    apiClient.post('/users/register-employee', data),
  update: (id: number, data: UpdateUserDto) =>
    apiClient.patch<User>(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
}
