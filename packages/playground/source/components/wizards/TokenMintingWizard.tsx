import type { TknInfo } from '@collective-governance/api-evm/types'
import type { JsonFragment } from '@ethersproject/abi'
import { useContext, useEffect, useMemo, useState } from 'react'
import { DaoToken__factory } from '@collective-governance/hardhat'
import { CtxProposal } from 'context'
import { useNavigate } from 'react-router-dom'
import BigNumberJS from 'bignumber.js'
import UnitConverter from 'components/proposal-editor/UnitConverter'
import JazzIcon from 'components/customs/JazzIcon'
import SxCard from 'components/customs/SxCard'
import SxBox from 'components/customs/SxBox'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import CheckIcon from '@mui/icons-material/PlaylistAddCheckCircle'
import InputAdornment from '@mui/material/InputAdornment'
import AddressBook from 'components/address-book/AddressBook'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

type ReceiverRowProps = {
  receiver: {
    address: string
    value: string
  }
  token: TknInfo
  index: number
  onRemove: (index: number) => void
}

const ReceiverRow: React.FC<ReceiverRowProps> = ({ receiver, token, index, onRemove }) => {
  const { decimals, symbol } = token!
  const tknAmount = receiver.value.shiftedBy(-decimals)
  return (
    <>
      <SxBox textAlign={'left'} display={'flex'}>
        <JazzIcon value={receiver.address} size={64} />
        <Typography variant='h4' sx={{ flex: 1, ml: 2, mt: 0.66 }} noWrap>
          {tknAmount} {symbol} - <small>{receiver.value} WEI</small> <br />
          <Typography variant='caption'>TOKEN RECEIVER: {receiver.address}</Typography>
        </Typography>
        <Box>
          <IconButton size='small'>
            <CloseIcon onClick={() => onRemove(index)} />
          </IconButton>
        </Box>
      </SxBox>
    </>
  )
}

type ReceiverInputFormProps = { onResult: (v: ReceiverRowProps['receiver']) => void }
const ReceiverInputForm: React.FC<ReceiverInputFormProps> = ({ onResult }) => {
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [receiverAmount, setReceiverAmount] = useState<string>('')

  function handleResult() {
    onResult({ address: receiverAddress, value: receiverAmount })
    setReceiverAddress('')
    setReceiverAmount('')
  }

  return (
    <>
      <Grid item md={6}>
        <TextField
          label='Receiver Address'
          variant='outlined'
          fullWidth
          value={receiverAddress}
          onChange={(ev) => setReceiverAddress(ev.target.value)}
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <AddressBook onResult={setReceiverAddress} />
                </InputAdornment>
              </>
            )
          }}
        />
      </Grid>
      <Grid item md={6}>
        <TextField
          label='Receiver Amount (will automatically add decimals)'
          variant='outlined'
          fullWidth
          value={receiverAmount}
          onChange={(ev) => setReceiverAmount(ev.target.value)}
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <UnitConverter onResult={setReceiverAmount} />
                </InputAdornment>
              </>
            )
          }}
        />
      </Grid>
      <Grid item md={12}>
        <Button onClick={handleResult} fullWidth variant='outlined' color='primary'>
          ADD RECEIVER
        </Button>
      </Grid>
    </>
  )
}

const TokenMintingWizard: React.FC = (props) => {
  const editor = useContext(CtxProposal)
  const navigate = useNavigate()
  const [targetTokenAddress, setTargetTokenAddress] = useState<string>('')
  const [targetTokenIsVerified, setTargetTokenIsVerified] = useState(false)
  const [targetTokenInfo, setTargetTokenInfo] = useState<TknInfo>()
  const [receivers, setReceivers] = useState<ReceiverRowProps['receiver'][]>([])

  const totalSupplyToMint = useMemo(() => {
    if (!targetTokenInfo) return '0'
    const result = receivers.reduce<BigNumberJS>((acc, receiver) => {
      return acc.plus(receiver.value)
    }, '0'.toBN())
    return result.shiftedBy(-targetTokenInfo!.decimals).pretty()
  }, [receivers, targetTokenInfo])

  function continueToEditor () {
    const abi: any = DaoToken__factory.abi.find((x: JsonFragment) => x.name === 'mint')
    let description = `# Mint ${totalSupplyToMint} ${targetTokenInfo!.symbol} to to ${receivers.length} total receivers.\n\n`

    for (const receiver of receivers) {
      editor.addOperation({
        target: targetTokenAddress,
        abi: abi, parameters: {
          0: receiver.address,
          1: receiver.value
        },
      })

      description += `- ${receiver.address} - ${receiver.value}\n`
    }
    
    editor.dispatch({ type: 'set-description', payload: description })
    navigate(`/editor#proposal-description-editor`)
  }

  useEffect(() => {
    if (!targetTokenAddress.isAddress()) {
      setTargetTokenInfo(undefined)
      setTargetTokenIsVerified(false)
    } else {
      editor.isOwnedMintToken(targetTokenAddress).then(res => {
        if (!res) {
          setTargetTokenIsVerified(false)
          setTargetTokenInfo(undefined)
        } else {
          setTargetTokenIsVerified(true)
          setTargetTokenInfo(res)
        }
      })
    }
  }, [targetTokenAddress])

  return (
    <SxCard sx={{ p: 2, pt: 2, mb: 2, textAlign: 'left' }}>
      <Typography variant='h2'>TOKEN MINTING WIZARD</Typography>
      <Divider />
      <Typography variant='body2' component='div' sx={{ mb: 2 }}>
        This helper form will generate a proposal to mint tokens from your given target token address to multiple receivers with
        individual balances.
      </Typography>
      <TextField
        label='Target Token Contract Address'
        variant='outlined'
        fullWidth
        value={targetTokenAddress}
        onChange={(ev) => setTargetTokenAddress(ev.target.value)}
        InputProps={{
          endAdornment: (
            <>
              <InputAdornment position='end'>
                <IconButton>
                  {!targetTokenIsVerified ? <DoNotDisturbIcon color='error' /> : <CheckIcon color='success' />}
                </IconButton>
                <AddressBook onResult={setTargetTokenAddress} addressType='CONTRACT' />
              </InputAdornment>
            </>
          )
        }}
      />
      <Collapse in={targetTokenIsVerified}>
        <>
          {targetTokenInfo && (
            <Alert severity='success'>
              TOKEN IS VALID - {targetTokenInfo.name}
              {' - '}
              TOTAL SUPPLY: {targetTokenInfo.totalSupply.shiftedBy(-targetTokenInfo.decimals).prettyNum()} {targetTokenInfo.symbol}
            </Alert>
          )}
          <Divider />
          <Grid container spacing={2}>
            {receivers.map((receiver, index) => {
              return (
                <Grid item md={12} key={`_receiver_${receiver.address}_${index}`}>
                  <ReceiverRow
                    index={index}
                    receiver={receiver}
                    token={targetTokenInfo!}
                    onRemove={(idx) => {
                      console.log(`removing receiver with index: ${idx}`)
                      setReceivers(receivers.filter((_, i) => i !== idx))
                    }}
                  />
                </Grid>
              )
            })}
            <ReceiverInputForm
              onResult={({ address, value }) => {
                setReceivers([...receivers, { address, value }])
              }}
            />
          </Grid>
          <Divider />
          {targetTokenInfo && (
            <Typography variant='body2' component='div' sx={{ mb: 2 }}>
              You are about to mint {totalSupplyToMint} {targetTokenInfo.symbol} to {receivers.length} total receivers.
            </Typography>
          )}
          <Button onClick={continueToEditor} variant='outlined' fullWidth color='success'>
            CONTINUE CREATE PROPOSAL
          </Button>
        </>
      </Collapse>
    </SxCard>
  )
}

export default TokenMintingWizard
