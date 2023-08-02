import { useContext } from 'react'
import { CtxProposal } from 'context'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'

// @note useMemo
const DrawOperations: React.FC = () => {
  const { t } = useTranslation()
  const { state, dispatch } = useContext(CtxProposal)
  const { operations } = state
  return (
    <>
      {operations.map((operation, index) => {
        const { target, signature, callData } = operation
        const key = `${index}_${target}`

        return (
          <Alert
            key={key}
            sx={{ mt: 2 }}
            action={
              <IconButton
                aria-label='close'
                color='inherit'
                size='small'
                onClick={() => {
                  dispatch({ type: 'remove-operation', index })
                }}
              >
                <CloseIcon fontSize='inherit' />
              </IconButton>
            }
          >
            <Typography component={'p'} variant='caption' align='left'>
              {t('Signature').toUpperCase()}: {signature}
            </Typography>
            <Typography component={'p'} variant='caption' align='left'>
            {t('Target Address').toUpperCase()}: {target}
            </Typography>
            <Typography
              component={'p'}
              variant='caption'
              align='left'
              style={{
                wordWrap: 'break-word'
              }}
            >
              {t('Calldata').toUpperCase()}: {callData}
            </Typography>
          </Alert>
        )
      })}
    </>
  )
}

export default DrawOperations
