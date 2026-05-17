import { Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h1" color="primary">404</Typography>
      <Typography variant="h5" gutterBottom>Страница не найдена</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>На главную</Button>
    </Box>
  )
}
