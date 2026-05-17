import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginResponse } from '../types/api'

interface AuthState {
  token: string | null
  user: LoginResponse['user'] | null
  isAuthenticated: boolean
  setAuth: (data: LoginResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          token: data.access_token,
          user: data.user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
