import type { DeployedResult, DaoWrapped, TknInfo } from 'types'
import { isERC20Permit } from '@collective-governance/api-evm'
import { useEffect, useMemo, useState } from 'react'
import { useApplication, useTranslation } from 'hooks'
import AddressBook from 'components/address-book/AddressBook'
import ApprovalBox from 'components/customs/ApprovalBox'
import SxCardHead from 'components/customs/SxCardHead'
import WrappedMethods from './WrappedMethods'
import JazzIcon from 'components/customs/JazzIcon'
import SxCard from 'components/customs/SxCard'
import InputAdornment from '@mui/material/InputAdornment'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Box from '@mui/system/Box'

interface WrappedDeploymentProps {
  wrappedAddress?: string
}

const WrappedDeployment: React.FC<WrappedDeploymentProps> = ({ wrappedAddress }) => {
  const { t } = useTranslation()
  const [wrappedInfo, setWrappedInfo] = useState<TknInfo>()
  const [deployed, setDeployed] = useState<DeployedResult<DaoWrapped>>()
  const [address, setAddress] = useState<string>(wrappedAddress || '')
  const [isValidERC20, setIsValidERC20] = useState(false)
  const [isValidERC20Permit, setIsValidERC20Permit] = useState(false)
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const { governance, ethers } = useApplication()
  const [isAllowed, setIsAllowed] = useState(false)

  function handleDeploy(blankERC20: boolean) {
    if (name !== '' && symbol !== '') {
      if (blankERC20) {
        governance.deployERC20(name, symbol)
        return
      }
      if (address && isValidERC20) {
        governance.deployDaoWrapped(address, name, symbol).then(setDeployed)
      }
    }
  }

  useEffect(() => {
    if (!address || !address.isAddress()) {
      setIsValidERC20(false)
      setIsValidERC20Permit(false)
      setWrappedInfo(undefined)
      setName('')
      setSymbol('')
      setDeployed(undefined)
      return
    }
    governance.isValidERC20(address).then(setIsValidERC20)
  }, [address])

  useEffect(() => {
    if (!isValidERC20 || !address || !address.isAddress()) return
    governance.isValidWrapped(address).then(async (isWrapped) => {
      if (!isWrapped) {
        setWrappedInfo(undefined)
        return
      }
      const info = await governance.getTknInfo(governance.getWrappedDaoToken(address)!)
      setWrappedInfo(info)
      if (!ethers.provider || !info.underlying) return
      const bytecode = await ethers.provider.getCode(info.underlying)
      
      if (isERC20Permit(bytecode)){
        setIsValidERC20Permit(true)
      }
      else setIsValidERC20Permit(false)
    })
  }, [isValidERC20])

  useEffect(() => {
    if (!wrappedInfo) return
    setName(wrappedInfo.name)
    setSymbol(wrappedInfo.symbol)
  }, [wrappedInfo])

  const canDeployWrapper = useMemo(() => {
    if (wrappedInfo) return false
    return isValidERC20 && name !== '' && symbol !== ''
  }, [isValidERC20, name, symbol])

  const isDeployed = useMemo(() => {
    return deployed && deployed.deployTx.isKeccakHash()
  }, [deployed])

  const showApprovalBox = useMemo(() => {
    if (isValidERC20Permit) return false
    return isValidERC20 && wrappedInfo && wrappedInfo.underlying
  }, [isValidERC20, wrappedInfo?.underlying, isValidERC20Permit])

  const showMethods = useMemo(() => {
    return (isValidERC20Permit && wrappedInfo) || isAllowed
  }, [isValidERC20, wrappedInfo?.underlying, isValidERC20Permit, isAllowed])

  return (
    <>
      <SxCard sx={{ textAlign: 'left', mb: 2 }}>
        <SxCardHead title='TOKEN TO WRAP' />
        {!wrappedInfo ? (
          <Typography variant='body1' sx={{ mb: 2 }}>
            {t('Please enter a valid ERC20 token address. A JazzIcon will appear when the provided token is valid.')}
          </Typography>
        ) : (
          <Typography variant='body1' sx={{ mb: 2 }}>
            {t('Valid ERC20 DaoWrapper token address provided!')}
          </Typography>
        )}
        <TextField
          value={address}
          fullWidth
          onChange={(ev) => setAddress(ev.target.value)}
          label='address'
          variant='outlined'
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  {isValidERC20 && address && (
                    <>
                      <IconButton>
                        <JazzIcon value={address} size={24} />
                      </IconButton>
                    </>
                  )}
                  <AddressBook
                    onResult={(r) => {
                      setAddress(r as string)
                    }}
                  />
                </InputAdornment>
              </>
            )
          }}
        />
        <Collapse in={isValidERC20} timeout={666}>
          <Box>
            <Divider />
            <SxCardHead title='WRAPPED TOKEN INFORMATION' />
            <Typography variant='body1' sx={{ mb: 2 }}>
              {t('Name and Symbol for your wrapped DAO token')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <TextField value={name} onChange={(ev) => setName(ev.target.value)} label='name' variant='outlined' fullWidth />
              </Grid>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <TextField
                  value={symbol}
                  onChange={(ev) => setSymbol(ev.target.value)}
                  label='decimals'
                  variant='outlined'
                  fullWidth
                />
              </Grid>
            </Grid>

            <ButtonGroup size='large' sx={{ mt: 2 }} variant='outlined' fullWidth>
              <Button disabled={!canDeployWrapper} onClick={() => handleDeploy(false)}>
                {wrappedInfo ? `TOKEN INFO LOADED` : `DEPLOY DAO WRAPPER`}
              </Button>
            </ButtonGroup>
          </Box>
        </Collapse>
        {deployed && (
          <Collapse in={isDeployed} timeout={666}>
            <Box sx={{ mt: 2, display: 'flex' }}>
              <JazzIcon style={{ flex: 1 }} value={deployed.address} size={66} />
              <Typography sx={{ flex: 2, flexGrow: 2, ml: 2, pt: 0.6 }} noWrap>
                ADDRESS: {deployed.address} <br />
                TX HASH: {deployed.deployTx}
              </Typography>
            </Box>
          </Collapse>
        )}
      </SxCard>
      {showMethods && wrappedInfo && (
        <WrappedMethods info={wrappedInfo} permit={isValidERC20Permit} />
      )}
      {showApprovalBox && wrappedInfo && (
        <SxCard sx={{ textAlign: 'left', mb: 2 }}>
          <ApprovalBox
            contractAddress={wrappedInfo.underlying}
            spenderAddress={wrappedInfo.address!}
            onResult={(r) => {
              if (r.value === '0') setIsAllowed(false)
              else setIsAllowed(true)
            }}
          />
        </SxCard>
      )}
    </>
  )
}

export default WrappedDeployment
