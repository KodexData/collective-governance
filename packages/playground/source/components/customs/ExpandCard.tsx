import type { BoxProps } from '@mui/material/Box'
import { useState } from 'react'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import SxCard from './SxCard'

interface ExpandCardProps extends BoxProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  transparent?: boolean
  title?: string
}

const ExpandCard: React.FC<ExpandCardProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(true)
  return (
    <SxCard {...props}>
      <Typography sx={{ cursor: 'pointer' }} variant='h4' align='left' onClick={() => setIsExpanded(!isExpanded)}>
        {props.title || 'UNNAMED'}
      </Typography>
      <Collapse in={isExpanded} timeout={666} defaultChecked>
        {props.children}
      </Collapse>
    </SxCard>
  )
}

export default ExpandCard
