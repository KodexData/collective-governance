import type { SxProps } from 'types'
import type { BoxProps } from '@mui/material/Box'
import Box from '@mui/material/Box'

interface SxBoxProps extends BoxProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  transparent?: boolean
}

const SxCard: React.FC<SxBoxProps> = (props) => {
  const sxProps: SxProps = {
    bgcolor: props.transparent ? 'background.default' : 'background.paper',
    p: 2,
    borderRadius: 4,
  }
  
  return (
    <Box {...props} sx={{ ...sxProps, ...props.sx }} style={props.style} className={props.className}>
      {props.children}
    </Box>
  )
}

export default SxCard
