import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testsApi } from '../api/tests'
import type { CreateTestDto, SubmitTestDto } from '../types/api'

export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: () => testsApi.getAll().then((r) => r.data),
  })
}

export function useTest(id: number) {
  return useQuery({
    queryKey: ['tests', id],
    queryFn: () => testsApi.getById(id).then((r) => r.data),
    enabled: !!id,
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
  return useQuery({
    queryKey: ['test-results', params],
    queryFn: () => testsApi.getResults(params).then((r) => r.data),
  })
}