import { Card, CardContent, Box, Typography, Chip } from '@mui/material'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info'
  onClick?: () => void
  trend?: { value: number; label: string }
}

export function KpiCard({ title, value, subtitle, icon, color, onClick, trend }: KpiCardProps) {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',        // растягиваем на всю высоту Grid item
        display: 'flex',
        flexDirection: 'column',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 4 } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,           // 16px со всех сторон
        pb: 2,          // явно 16px снизу
        '&:last-child': { pb: 2 }  // переопределяем дефолт MUI
      }}>
        {/* Верхняя часть: заголовок + иконка */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          mb: 1.5
        }}>
          <Typography 
            color="text.secondary" 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              lineHeight: 1.3,
              // фиксируем высоту на 2 строки
              minHeight: '2.6em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              color: `${color}.main`,
              bgcolor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,  // не сжимаем
              ml: 1.5,        // отступ от текста
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Средняя часть: значение */}
        <Typography 
          variant="h4" 
          component="div" 
          color={`${color}.main`} 
          sx={{ 
            fontWeight: 'bold',
            lineHeight: 1.2,
            mb: 1
          }}
        >
          {value}
        </Typography>

        {/* Нижняя часть: subtitle + trend */}
        <Box sx={{ 
          minHeight: '2em',  // фиксируем высоту нижней части
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5
        }}>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
              {subtitle}
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ visibility: 'hidden', lineHeight: 1.3 }}>
              &nbsp;
            </Typography>
          )}
          
          {trend ? (
            <Chip
              size="small"
              label={`${trend.value > 0 ? '+' : ''}${trend.value}% ${trend.label}`}
              color={trend.value >= 0 ? 'success' : 'error'}
              sx={{ height: 20, width: 'fit-content' }}
            />
          ) : (
            <Box sx={{ height: 20 }} />  // placeholder для выравнивания
          )}
        </Box>
      </CardContent>
    </Card>
  )
}