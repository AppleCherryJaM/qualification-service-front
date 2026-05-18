import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { setToken, removeToken, setStoredUser, removeStoredUser } from '../api/client'
import type { LoginDto } from '../types/api'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.access_token)
      setStoredUser(data.user)
      setAuth(data)
      queryClient.setQueryData(['me'], data.user)
      navigate('/', { replace: true })
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return async () => {
    try {
      await authApi.logout()
    } catch {
      // Игнорируем ошибки
    } finally {
      removeToken()
      removeStoredUser()
      logout()
      navigate('/login', { replace: true })
    }
  }
}