import type { SxProps } from 'types'
import type { BoxProps } from '@mui/material/Box'
import Box from '@mui/material/Box'

interface SxBoxProps extends BoxProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  asPaper?: boolean
}

const SxBox: React.FC<SxBoxProps> = ({asPaper, ...props}) => {
  const sxProps: SxProps = {
    bgcolor: asPaper ? 'background.paper' : 'background.default',
    p: 2,
    borderRadius: 4,
    opacity: 0.666,
    minHeight: '100%'
  }
  
  return (
    <Box {...props} sx={{ ...sxProps, ...props.sx }} style={props.style} className={props.className}>
      {props.children}
    </Box>
  )
}

export default SxBox
