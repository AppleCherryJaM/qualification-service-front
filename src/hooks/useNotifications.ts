import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../api/notifications'
import { NotificationFilters } from '@/types/api';

export function useNotifications(filters?: NotificationFilters) {
  const cleanFilters = filters
    ? Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== null))
    : undefined

  return useQuery({
    queryKey: ['notifications', cleanFilters],
    queryFn: () => notificationsApi.getAll(cleanFilters).then((r) => r.data),
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}