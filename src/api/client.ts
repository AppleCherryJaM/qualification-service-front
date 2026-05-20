import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants'
import { LoginResponse } from '../types/api'
import { scheduleTokenRefresh, cancelTokenRefresh } from '../utils/token-refresh'

let isRefreshing = false
let refreshSubscribers: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []
let isRedirecting = false

function onRefreshed(token: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(token))
  refreshSubscribers = []
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(error))
  refreshSubscribers = []
}

function addRefreshSubscriber(
  resolve: (token: string) => void,
  reject: (error: unknown) => void
) {
  refreshSubscribers.push({ resolve, reject })
}

export function triggerLogout() {
  console.log('[triggerLogout] called')
  if (isRedirecting) return
  isRedirecting = true

  // Отменяем проактивный таймер при принудительном logout
  cancelTokenRefresh()

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('auth-storage')
  localStorage.removeItem('user')

  import('../stores/authStore').then(({ useAuthStore }) => {
    useAuthStore.getState().logout()
  })

  window.location.replace('/login')
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('[interceptor]', error.config?.url, 'status:', error.response?.status)

    const originalRequest = error.config

    if (originalRequest.url?.includes('/auth/')) {
      console.log('[interceptor] skipping retry for /auth/ route')
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[interceptor] 401 detected, attempting refresh...')

      if (isRefreshing) {
        console.log('[interceptor] refresh already in progress, queuing request')
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(
            (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            (err) => reject(err)
          )
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('[interceptor] calling /auth/refresh...')
        const { data } = await apiClient.post<LoginResponse>(
          '/auth/refresh',
          {},
          { withCredentials: true }
        )

        const newToken = data.access_token
        console.log('[interceptor] refresh success, new token:', newToken.slice(0, 20))

        localStorage.setItem(TOKEN_KEY, newToken)

        import('../stores/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().setAuth(data)
        })

        onRefreshed(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError: any) {
        console.error('[interceptor] refresh FAILED')
        console.error('  status:', refreshError.response?.status)
        console.error('  data:', refreshError.response?.data)
        onRefreshFailed(refreshError)
        triggerLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getStoredUser(): LoginResponse['user'] | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user: LoginResponse['user']) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function removeStoredUser() {
  localStorage.removeItem('user')
}