import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesApi } from '../api/courses'
import type { CreateCourseDto, UpdateCourseDto } from '../types/api'

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll().then((r) => r.data),
  })
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.getById(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCourseDto) => coursesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseDto }) =>
      coursesApi.update(id, data).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}