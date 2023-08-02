import type { AddressInformation } from 'types'
import { CtxEthers, CtxState, CtxGovernance } from 'context'
import { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AddressStorage from 'components/address-book/AddressStorage'
import AddressBook from 'components/address-book/AddressBook'
import JazzIcon from 'components/customs/JazzIcon'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Container from '@mui/material/Container'
import Checkbox from '@mui/material/Checkbox'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'

const ConnectGovernance: React.FC<{ chainId?: number }> = (props) => {
  const { t } = useTranslation()
  const governance = useContext(CtxGovernance)
  // prettier-ignore
  const { state: { loggedOut } } = useContext(CtxState)
  // prettier-ignore
  const { state: { chainId } } = useContext(CtxEthers)
  const [addresses, setAddAddress] = useState<AddressInformation[]>()
  const [isValidHash, setIsValidHash] = useState(false)
  const [checked, setChecked] = useState(false)
  const [addr, setAddr] = useState('')

  const connect = () => {
    if (isValidHash) {
      governance
        .initialize(addr, 'Connect.tsx')
        .then(() => {})
        .catch((error) => {})
    }
  }

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    setChecked(checked)

    if (!chainId) return
    const key = getStoreKey(chainId)
    if (checked) {
      if (addr.isAddress()) {
        localStorage.setItem(key, addr.toChecksumAddress())
        console.log(`save ${key}`)
      }
    } else {
      localStorage.removeItem(key)
      console.log(`remove ${key}`)
    }
  }

  const getStoreKey = (chainId: number) => `dc_governor-default-${chainId}`

  const getStoredDefaultAddress = () => {
    if (!chainId) return
    const key = getStoreKey(chainId)
    const data = localStorage.getItem(key)
    if (!data || !data.isAddress()) return
    return data.toChecksumAddress()
  }

  useEffect(() => {
    if (!chainId) return
    const store = new AddressStorage(chainId)
    setAddAddress(store.data.filter((x) => x.description.includes('governance')))
    const storedDefault = getStoredDefaultAddress()
    if (storedDefault && !loggedOut) {
      setChecked(true)
      governance
        .initialize(storedDefault, 'Connect.tsx')
        .then(() => {})
        .catch((error) => {})
    }
  }, [chainId])

  useEffect(() => {
    setIsValidHash(!(!addr || !addr.isAddress()))
    setChecked(false)
  }, [addr])

  return (
    <>
      <Container
        maxWidth='xs'
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 4,
          height: '100%'
        }}
      >
        <Card sx={{ p: 2, pt: 3, textAlign: 'center', borderRadius: '16px' }} elevation={2}>
          <Typography variant='h4' gutterBottom sx={{ mb: 2 }}>
            {t('Connect to Governance Contract')} <small>({chainId})</small>
          </Typography>
          <JazzIcon size={250} value={addr} />
          <Typography variant='h6' gutterBottom sx={{ mt: 2, mb: 1 }}>
            {t('Enter valid governance address')}
          </Typography>

          <TextField
            label={t('Contract Address')}
            fullWidth
            variant='outlined'
            size='small'
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            InputProps={{
              endAdornment: (
                <>
                  <InputAdornment position='end'>
                    <Tooltip title={t('Stay logged in until next logout')} placement='bottom-end'>
                      <Checkbox size='small' value={checked} onChange={handleClick} />
                    </Tooltip>

                    {addresses && <AddressBook size='small' addresses={addresses} onResult={setAddr} />}
                  </InputAdornment>
                </>
              )
            }}
          />
          <Divider sx={{ mt: 1, mb: 3 }} />
          <Button onClick={connect} variant='outlined' color='info' fullWidth>
            {t('Connect Contract')}
          </Button>
        </Card>
      </Container>
    </>
  )
}

export default ConnectGovernance
