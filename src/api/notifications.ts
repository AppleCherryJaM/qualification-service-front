import { apiClient } from './client'
import type { Notification, NotificationFilters } from '../types/api'

export const notificationsApi = {
  getAll: (filters?: NotificationFilters) =>
    apiClient.get<Notification[]>('/notifications', { params: filters }),

  markAsRead: (id: number) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`),

  create: (data: Partial<Notification>) =>
    apiClient.post<Notification>('/notifications', data),
}