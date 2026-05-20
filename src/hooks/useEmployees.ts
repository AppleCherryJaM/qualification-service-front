import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeesApi, type EmployeeFilters } from '../api/employees'
import { useAuthStore } from '../stores/authStore'

export function useEmployees(filters?: EmployeeFilters) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeesApi.getAll(filters).then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useEmployee(id: number) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.getById(id).then((r) => r.data),
    enabled: isAuthenticated && !!id,
  })
}

export function useEmployeeAllowance(id: number) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['employees', id, 'allowance'],
    queryFn: () => employeesApi.getAllowance(id).then((r) => r.data),
    enabled: isAuthenticated && !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof employeesApi.create>[0]) =>
      employeesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof employeesApi.update>[1] }) =>
      employeesApi.update(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}