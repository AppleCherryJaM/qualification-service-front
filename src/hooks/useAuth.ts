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
  const queryClient = useQueryClient()

  return async () => {
    // 1. Сначала чистим локальное состояние — не зависим от ответа сервера
    removeToken()
    removeStoredUser()
    logout()
    queryClient.clear()

    // 2. Редиректим
    navigate('/login', { replace: true })

    // 3. Уведомляем сервер — fire-and-forget, результат нас не блокирует.
    // Важно: НЕ await и НЕ в finally — иначе ошибка /auth/logout
    // (например 401 при истёкшем токене) вызовет повторный logout.
    authApi.logout().catch(() => {
      // Сервер недоступен или токен уже невалиден — нам всё равно
    })
  }
}