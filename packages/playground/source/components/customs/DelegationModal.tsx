import { useEffect, useMemo, useState } from 'react'
import { useApplication, useTranslation } from 'hooks'
import AddressBook from 'components/address-book/AddressBook'
import AddTokenChip from './AddTokenChip'
import DarkModal from './DarkModal'
import JazzIcon from './JazzIcon'
import InputAdornment from '@mui/material/InputAdornment'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

const DelegationModal: React.FC = () => {
  const [delegatee, setDelegatee] = useState<string>()
  const [targetAddress, setTargetAddress] = useState<string>('')
  const [isValidTarget, setIsValidTarget] = useState(false)
  const { context, ethers, governance, snackbar, theme } = useApplication()
  const { t } = useTranslation()

  const handleClose = () => context.dispatch({ type: 'set-delegate-open', payload: false })

  const handleDelegate = () => {
    const { address } = context.state.delegation || {}
    if (address && targetAddress && address.addrIsEqual(targetAddress)) {
      if (!targetAddress.isEtherAddress()) {
        snackbar.enqueueSnackbar('given input account is already delegated', { variant: 'warning' })
        //return
      }
    }
    governance.delegate(targetAddress)
  }

  useEffect(() => {
    if (!ethers.state.address || !ethers.state.address.isAddress()) return

    setTargetAddress(ethers.state.address)
    setIsValidTarget(true)

    const token = governance.getDaoToken()
    if (!token) return
    token.delegates(ethers.state.address!).then(setDelegatee)
  }, [ethers.state.address])

  useEffect(() => {
    if (!context.state.delegation || !context.state.delegation.address?.isAddress()) return
    setTargetAddress(context.state.delegation!.address)
    setIsValidTarget(true)
  }, [context.state.delegation, context.state.delegation?.address])

  const label = useMemo(() => {
    if (targetAddress.isAddress() && ethers.state.address && targetAddress.addrIsEqual(ethers.state.address)) {
      return 'enter delegatee address (injected wallet address)'
    }
    return 'enter delegatee address'
  }, [ethers.state.address, targetAddress])

  const showDelegationWarning = useMemo(() => {
    if (!ethers.state.address || !delegatee) return
    return !delegatee.addrIsEqual(ethers.state.address)
  }, [ethers.state.address, delegatee])

  return (
    <>
      <DarkModal
        open={context.state.delegateOpen}
        handleClose={handleClose}
        sx={{
          width: '50vw',
          height: 'auto',
          [theme.breakpoints.down('md')]: {
            width: '90vw'
          }
        }}
      >
        <Typography variant='h1'>{t('Delegate Tokens').toUpperCase()}</Typography>
        {context.state.delegation && <>{t('Delegatee').toUpperCase()}: {delegatee || context.state.delegation.delegates}</>}
        <Divider />
        {showDelegationWarning && (
          <Alert severity='warning' sx={{ mb: 2 }}>
            {t('#delegation-note')}
          </Alert>
        )}
        <TextField
          value={targetAddress}
          fullWidth
          size='small'
          onChange={(ev) => setTargetAddress(ev.target.value)}
          label={label}
          variant='outlined'
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  {isValidTarget && targetAddress && (
                    <IconButton>
                      <JazzIcon value={targetAddress} size={24} />
                    </IconButton>
                  )}
                  <AddressBook onResult={setTargetAddress} addressType='CONTRACT' />
                </InputAdornment>
              </>
            )
          }}
        />
        <Typography variant='caption' component='div' sx={{ mb: 2, mt: 1 }}>
          {t('#delegation-information')}
        </Typography>
        <ButtonGroup variant='outlined' fullWidth>
          <Button color='success' onClick={handleDelegate}>
            {t('Delegate Tokens')}
          </Button>
        </ButtonGroup>
        <Divider />
        <Box sx={{ textAlign: 'center' }}>
          <AddTokenChip />
        </Box>
      </DarkModal>
    </>
  )
}

export default DelegationModal
