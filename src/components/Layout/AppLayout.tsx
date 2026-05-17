import { Outlet } from 'react-router-dom'
import { Box, CssBaseline } from '@mui/material'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppHeader />
      <AppSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { xs: 0, md: 28 },
          width: { xs: '100%', md: `calc(100% - 224px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
