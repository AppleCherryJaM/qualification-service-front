import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentsApi } from '../api/course-assignments'
import { useAuthStore } from '../stores/authStore'
import type { CreateAssignmentDto, CompleteAssignmentDto, AssignmentFilters } from '../types/api'

export function useAssignments(filters?: AssignmentFilters) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => assignmentsApi.getAll(filters).then((r) => r.data),
    enabled: isAuthenticated,
  })
}

export function useAssignment(id: number) {
  const isAuthenticated = useAuthStore((s) => !!s.token && !!s.user)
  
  return useQuery({
    queryKey: ['assignments', id],
    queryFn: () => assignmentsApi.getById(id).then((r) => r.data),
    enabled: isAuthenticated && !!id,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<import('../types/api').CourseAssignment>) =>
      assignmentsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export function useAssignCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssignmentDto) =>
      assignmentsApi.assign(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useCompleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteAssignmentDto }) =>
      assignmentsApi.complete(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignments', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => assignmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export function useCheckOverdue() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => assignmentsApi.checkOverdue().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}