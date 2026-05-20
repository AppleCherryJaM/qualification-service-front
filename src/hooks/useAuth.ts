import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../stores/authStore'
import { setToken, removeToken, setStoredUser, removeStoredUser } from '../api/client'
import type { LoginDto } from '../types/api'

export function useLogin() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // НЕ делаем navigate здесь — App.tsx сам увидит token и сделает <Navigate to="/" />
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  return async () => {
    removeToken()
    removeStoredUser()
    logout()
    queryClient.clear()
    navigate('/login', { replace: true })

    authApi.logout().catch(() => {
      // Сервер недоступен или токен уже невалиден
    })
  }
}