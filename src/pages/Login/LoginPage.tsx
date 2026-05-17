import { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff, School as SchoolIcon } from '@mui/icons-material'
import { useLogin } from '../../hooks/useAuth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login.mutate({ email, password })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            ИС Учёт повышения квалификации
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Вход в систему
          </Typography>
        </Box>

        {login.isError && (
          <Alert severity="error">
            {(login.error as any)?.response?.data?.message || 'Ошибка авторизации'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoFocus
            placeholder="ivanov@company.ru"
          />
          <TextField
            label="Пароль"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={login.isPending}
            sx={{ mt: 1 }}
          >
            {login.isPending ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
          Демо: admin@company.ru / admin123
        </Typography>
      </Paper>
    </Box>
  )
}
