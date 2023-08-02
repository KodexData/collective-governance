import type { SxProps } from '@mui/material'
import type { BoxProps } from '@mui/material/Box'
import Box from '@mui/material/Box'

interface RTBoxProps extends BoxProps {
  children: React.ReactNode
  sx?: SxProps
}

const RTBox: React.FC<RTBoxProps> = ({ children, ...props }) => (
  <Box
    {...props}
    sx={{
      position: 'relative',
      zIndex: 900,
      textAlign: 'right',
      top: '-13px',
      right: '-11px',
      ...props.sx
    }}
  >
    {children}
  </Box>
)

export default RTBox
