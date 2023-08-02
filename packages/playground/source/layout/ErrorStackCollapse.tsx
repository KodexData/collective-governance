import { useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'

const ErrorStackCollapse: React.FC<{ error: Error }> = ({ error }) => {
  const head = useMemo(() => (error.stack || '').split('\n')[0].trim(), [error])
  const [expanded, setExpanded] = useState(false)
  const toggle = () => setExpanded(!expanded)

  return (
    <>
      <Collapse in={!expanded} timeout={666}>
        <Typography variant='caption' component='pre' onClick={toggle}>
          {head}
        </Typography>
      </Collapse>
      <Collapse in={expanded} timeout={666} onClick={toggle}>
        <Typography variant='caption' component='pre'>
          {error.stack}
        </Typography>
      </Collapse>
    </>
  )
}

export default ErrorStackCollapse