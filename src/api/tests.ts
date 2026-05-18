import { apiClient } from './client'
import type { Test, CreateTestDto, SubmitTestDto, TestResult } from '../types/api'

export const testsApi = {
  getAll: () => apiClient.get<Test[]>('/tests'),
  getById: (id: number) => apiClient.get<Test>(`/tests/${id}`),
  create: (data: CreateTestDto) => apiClient.post<Test>('/tests', data),
  delete: (id: number) => apiClient.delete(`/tests/${id}`),
  submit: (id: number, data: SubmitTestDto) =>
    apiClient.post<{ score: number; passed: boolean }>(`/tests/${id}/submit`, data),
  getResults: (params?: { employeeId?: number; testId?: number }) =>
    apiClient.get<TestResult[]>('/tests/results', { params }),
}