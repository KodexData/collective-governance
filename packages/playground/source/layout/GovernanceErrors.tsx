import { useContext, useMemo, useState } from 'react'
import { CtxState } from 'context'
import ExpandCard from 'components/customs/ExpandCard'
import ErrorStackCollapse from './ErrorStackCollapse'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// @note useMemo
const GovernanceErrors: React.FC = () => {
  const ctx = useContext(CtxState)
  const { errors } = ctx.state

  const hasErrored = useMemo(() => {
    return errors.length > 0
  }, [errors])

  return (
    <Collapse in={hasErrored} timeout={666}>
      <ExpandCard title='GOVERNANCE ERRORS' sx={{ p: 2, pt: 2, mb: 2, textAlign: 'left' }}>
        <Divider />
        {hasErrored &&
          errors.map((error, index) => (
            <Alert
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    ctx.dispatch({ type: 'remove-error', index })
                  }}
                >
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              }
              key={`err_${index}`}
              severity='error'
              style={{ marginBottom: '1em', marginTop: '1em' }}
              onClick={() => console.error(error)}
            >
              {error.message}
              <ErrorStackCollapse error={error} />
            </Alert>
          ))}
      </ExpandCard>
    </Collapse>
  )
}

export default GovernanceErrors
