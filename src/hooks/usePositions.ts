import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { positionsApi } from '../api/positions'
import { useAuthStore } from '../stores/authStore'

export function usePositions() {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => positionsApi.getAll().then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ name: string }>) => positionsApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string }> }) =>
      positionsApi.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => positionsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  })
}