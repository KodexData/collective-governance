import { useScrollTrigger } from '@mui/material'
import Slide from '@mui/material/Slide'
import Grow from '@mui/material/Grow'

interface PropsHideOnScroll {
  window?: () => Window
  children: React.ReactElement
  fixed?: boolean
  invert?: boolean
  threshold?: number
  disableHysteresis?: boolean
  direction?: 'left' | 'right' | 'down' | 'up'
  grow?: boolean
  timeout?: number
}

const HideOnScroll: React.FC<PropsHideOnScroll> = (props) => {
  const { children, window, fixed, invert, threshold, disableHysteresis, direction, grow, timeout } = props
  const trigger = useScrollTrigger({ target: window ? window() : undefined, threshold, disableHysteresis })
  if (fixed) return children
  const defaultValues = {
    in: invert ? trigger : !trigger,
    appear: false
  }
  if (grow)
    return (
      <Grow {...defaultValues} timeout={timeout || 300}>
        {children}
      </Grow>
    )
  return (
    <Slide {...defaultValues} direction={direction || 'down'}>
      {children}
    </Slide>
  )
}

export default HideOnScroll
