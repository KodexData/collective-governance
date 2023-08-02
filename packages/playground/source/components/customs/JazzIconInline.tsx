import type { ReactNode } from 'react'
import type { IJazzIcon } from './JazzIcon'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import JazzIcon from './JazzIcon'

interface JazzIconInlineProps extends IJazzIcon {
  label?: string | ReactNode
  labelStyle?: React.CSSProperties
  children?: React.ReactNode
}

const JazzIconInline: React.FC<JazzIconInlineProps> = ({ size, value, label, children, style, labelStyle }) => (
  <Grid container direction='row' wrap={'nowrap'} alignItems='center' alignSelf={'center'} style={{ ...style, minWidth: '100%' }}>
    <Grid item>
      <JazzIcon value={value} size={size || 16} style={{ display: 'block', marginRight: '10px' }} />
    </Grid>
    <Grid item flexGrow={1}>
      <Typography component='div' noWrap>
        {label || children || value}
      </Typography>
    </Grid>
  </Grid>
)

export default JazzIconInline
