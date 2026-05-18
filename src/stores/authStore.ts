import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginResponse } from '../types/api'

interface AuthState {
  token: string | null
  user: LoginResponse['user'] | null
  expiresAt: number | null
  setAuth: (data: LoginResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      setAuth: (data) =>
        set({
          token: data.access_token,
          user: data.user,
          expiresAt: Date.now() + (data.expires_in * 1000),
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          expiresAt: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
      }),
    }
  )
)