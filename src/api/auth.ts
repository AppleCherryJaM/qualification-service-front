import { apiClient } from './client'
import type { LoginDto, LoginResponse } from '../types/api'

export const authApi = {
  login: (data: LoginDto) =>
    apiClient.post<LoginResponse>('/auth/login', data),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refresh: () =>
    apiClient.post<LoginResponse>('/auth/refresh'),
}