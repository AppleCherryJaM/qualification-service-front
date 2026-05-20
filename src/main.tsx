import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ruRU } from '@mui/material/locale'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Не ретраим обработанные ошибки (logout уже в процессе)
        if (error?._handled) return false
        // Ретраим 401 один раз — даём интерсептору время на рефреш
        if (error?.response?.status === 401 && failureCount < 1) {
          return true
        }
        return false
      },
      retryDelay: (retryCount) => retryCount * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
  },
  ruRU
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)