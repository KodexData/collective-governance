import type { BoxProps } from '@mui/material/Box'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import SxBox from './SxBox'

interface ExpandBoxProps extends BoxProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  noTitle?: boolean
  asPaper?: boolean
}

const ExpandBox: React.FC<ExpandBoxProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <SxBox {...props} onClick={() => setIsExpanded(!isExpanded)}>
      {!props.noTitle && <Typography sx={{ cursor: 'pointer' }} variant='h4' align='left'>
        {props.title || 'UNNAMED'}
      </Typography>}
      <Collapse in={isExpanded} timeout={666} defaultChecked orientation={props.orientation}>
        {props.children}
      </Collapse>
    </SxBox>
  )
}

export default ExpandBox
