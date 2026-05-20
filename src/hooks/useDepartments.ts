import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentsApi } from '../api/departments'
import { useAuthStore } from '../stores/authStore'

export function useDepartments() {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll().then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ name: string }>) => departmentsApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string }> }) =>
      departmentsApi.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => departmentsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  })
}