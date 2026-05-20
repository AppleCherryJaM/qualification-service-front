import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp: number
  iat: number
}

// Рефрешим за сколько секунд до истечения токена
const REFRESH_BEFORE_SECONDS = 60

let refreshTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleTokenRefresh(token: string, onRefresh: () => Promise<void>): void {
  cancelTokenRefresh()

  let payload: JwtPayload
  try {
    payload = jwtDecode<JwtPayload>(token)
  } catch {
    console.warn('[tokenRefresh] Failed to decode token, skipping proactive refresh')
    return
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const secondsUntilExpiry = payload.exp - nowSeconds

  if (secondsUntilExpiry <= 0) {
    console.warn('[tokenRefresh] Token already expired, skipping')
    return
  }

  // ← ФИКС: если токен живёт меньше порога — не планируем проактивный рефреш.
  // Реактивный interceptor справится сам.
  if (secondsUntilExpiry <= REFRESH_BEFORE_SECONDS) {
    console.warn(
      `[tokenRefresh] Token expires in ${secondsUntilExpiry}s which is less than ` +
      `REFRESH_BEFORE_SECONDS (${REFRESH_BEFORE_SECONDS}s). Skipping proactive refresh.`
    )
    return
  }

  const delay = (secondsUntilExpiry - REFRESH_BEFORE_SECONDS) * 1000

  console.log(
    `[tokenRefresh] Scheduled in ${Math.round(delay / 1000)}s ` +
    `(token expires in ${secondsUntilExpiry}s)`
  )

  refreshTimer = setTimeout(async () => {
    console.log('[tokenRefresh] Proactive refresh triggered')
    try {
      await onRefresh()
    } catch {
      // onRefresh сам обрабатывает ошибки
    }
  }, delay)
}

/**
 * Отменяет запланированный рефреш.
 * Вызывать при logout.
 */
export function cancelTokenRefresh(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
    console.log('[tokenRefresh] Timer cancelled')
  }
}