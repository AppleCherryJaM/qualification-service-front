import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginResponse } from '../types/api'
import { TOKEN_KEY } from '../utils/constants'

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
      },

      logout: () => {
        console.trace('[authStore] logout called from:')
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
        }
      },
    }
  )
)