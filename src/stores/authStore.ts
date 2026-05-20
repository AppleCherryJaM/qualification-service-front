import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginResponse } from '../types/api'
import { TOKEN_KEY } from '../utils/constants'
import { scheduleTokenRefresh, cancelTokenRefresh } from '../utils/token-refresh'

// Импортируем apiClient лениво чтобы избежать циклической зависимости:
// authStore → tokenRefresh → (onRefresh вызывает apiClient) → client
async function doRefresh(): Promise<void> {
  const { apiClient } = await import('../api/client')
  const { data } = await apiClient.post<LoginResponse>(
    '/auth/refresh',
    {},
    { withCredentials: true }
  )
  // setAuth сам перепланирует следующий таймер
  useAuthStore.getState().setAuth(data)
}

interface AuthState {
  token: string | null
  user: LoginResponse['user'] | null
  setAuth: (data: LoginResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (data) => {
        console.log('[authStore] setAuth called, token:', data.access_token?.slice(0, 20))
        localStorage.setItem(TOKEN_KEY, data.access_token)
        set({ token: data.access_token, user: data.user })

        // Планируем проактивный рефреш на основе exp из нового токена
        scheduleTokenRefresh(data.access_token, doRefresh)
      },

      logout: () => {
        console.trace('[authStore] logout called from:')

        // Отменяем таймер рефреша перед очисткой
        cancelTokenRefresh()

        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('user')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem(TOKEN_KEY, state.token)
          // После перезагрузки страницы восстанавливаем таймер
          // из сохранённого токена
          scheduleTokenRefresh(state.token, doRefresh)
        }
      },
    }
  )
)

const storedToken = localStorage.getItem(TOKEN_KEY)
const storedRaw = localStorage.getItem('auth-storage')
if (storedToken && storedRaw) {
  try {
    const parsed = JSON.parse(storedRaw)
    const { token, user } = parsed?.state || {}
    if (token && user) {
      useAuthStore.setState({ token, user })
    }
  } catch { /* empty */ }
}