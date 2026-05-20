import { Outlet } from 'react-router-dom'
import { Box, CssBaseline } from '@mui/material'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '224px 1fr' },
      gridTemplateRows: '64px 1fr',
      gridTemplateAreas: `
        "header header"
        "sidebar main"
      `,
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      
      {/* Header */}
      <Box sx={{ gridArea: 'header', position: 'fixed', width: '100%', zIndex: 1200 }}>
        <AppHeader />
      </Box>
      
      {/* Sidebar */}
      <Box sx={{ gridArea: 'sidebar', pt: 8 }}>
        <AppSidebar />
      </Box>
      
      {/* Main */}
      <Box
        component="main"
        sx={{
          gridArea: 'main',
          pt: 8,
          px: 3,
          pb: 3,
          overflow: 'auto',
          height: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
