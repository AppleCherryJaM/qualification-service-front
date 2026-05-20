import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingTypesApi } from '../api/training-types'
import { useAuthStore } from '../stores/authStore'

export function useTrainingTypes() {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  return useQuery({
    queryKey: ['training-types'],
    queryFn: () => trainingTypesApi.getAll().then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useCreateTrainingType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ name: string }>) => trainingTypesApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-types'] }),
  })
}

export function useUpdateTrainingType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string }> }) =>
      trainingTypesApi.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-types'] }),
  })
}

export function useDeleteTrainingType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => trainingTypesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-types'] }),
  })
}