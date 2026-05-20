import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { internshipsApi, type InternshipFilters } from '../api/internships'
import { useAuthStore } from '../stores/authStore'

export function useInternships(filters?: InternshipFilters) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  return useQuery({
    queryKey: ['internships', filters],
    queryFn: () => internshipsApi.getAll(filters).then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useCreateInternship() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<import('../types/api').Internship>) =>
      internshipsApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['internships'] }),
  })
}

export function useDeleteInternship() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => internshipsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['internships'] }),
  })
}