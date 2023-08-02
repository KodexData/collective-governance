import type { SxProps } from '@mui/material'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'

interface StatCardProps {
  value: React.ReactNode
  label: React.ReactNode
}

const sxProps: SxProps = {
  pt: 2,
  pb: 2,
  borderRadius: 5,
  textAlign: 'center',
  background: 'transparent'
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <Paper elevation={0} variant='outlined' sx={sxProps}>
      <Typography variant='h1'>{value}</Typography>
      <Divider sx={{ mt: 1, mb: 1 }} />
      <Typography variant='caption'>{label}</Typography>
    </Paper>
  )
}

export default StatCard
