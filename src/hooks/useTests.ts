import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '../api/tests'
import { useAuthStore } from '../stores/authStore'
import type { CreateTestDto, SubmitTestDto } from '../types/api'

export function useTests() {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.getAll().then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useTest(id: number) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['tests', id],
    queryFn: () => testsApi.getById(id).then((r) => r.data),
    enabled: isAuthenticated && !!id,
  })
}

export function useCreateTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTestDto) => testsApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] }),
  })
}

export function useDeleteTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => testsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] }),
  })
}

export function useSubmitTest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubmitTestDto }) =>
      testsApi.submit(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] })
      queryClient.invalidateQueries({ queryKey: ['test-results'] })
    },
  })
}

export function useTestResults(params?: { employeeId?: number; testId?: number }) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['test-results', params],
    queryFn: () => testsApi.getResults(params).then((r) => r.data),
    enabled: isAuthenticated && !!(params?.employeeId || params?.testId),
  })
}