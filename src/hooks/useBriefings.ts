import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { briefingsApi, type BriefingFilters } from '../api/briefings'
import { useAuthStore } from '../stores/authStore'

export function useBriefings(filters?: BriefingFilters) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  return useQuery({
    queryKey: ['briefings', filters],
    queryFn: () => briefingsApi.getAll(filters).then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useCreateBriefing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<import('../types/api').Briefing>) =>
      briefingsApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['briefings'] }),
  })
}

export function useDeleteBriefing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => briefingsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['briefings'] }),
  })
}