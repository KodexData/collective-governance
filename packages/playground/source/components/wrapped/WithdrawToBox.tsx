import { CtxWrapped, WrappedTokenState } from './context'
import { useContext, useState } from 'react'
import { useApplication } from 'hooks'
import { BigNumber } from '@ethersproject/bignumber'
import UnitConverter from 'components/proposal-editor/UnitConverter'
import InputAdornment from '@mui/material/InputAdornment'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/system/Box'

const WithdrawToBox: React.FC = () => {
  const { ethers } = useApplication()
  const [targetBalance, setTargetBalance] = useState<string>('')
  const wrapped = useContext(CtxWrapped) as Required<WrappedTokenState>

  async function withdrawTo() {
    if (!wrapped || !wrapped.contract || !ethers.state.address) return
    const amount = BigNumber.from(targetBalance)

    const receipt = await wrapped.contract
      .withdrawTo(ethers.state.address, amount, {
        gasLimit: 8000000
      })
      .then((t) => t.wait())
    wrapped.getData()
  }

  if (!wrapped.getData || !wrapped.info2) return <></>

  // prettier-ignore
  const {
    info1: { symbol: symbol1, decimals },
    info2: { symbol: symbol2 },
    balance1, balance2
  } = wrapped

  return (
    <Box>
      {balance1 && (
        <Typography>
          {symbol1} BALANCE: {balance1.toString().shiftedBy(-decimals)} {symbol1}
          {symbol2} BALANCE: {balance2.toString().shiftedBy(-decimals)} {symbol2}
        </Typography>
      )}
      <Box sx={{ flex: 1, flexGrow: 4 }}>
        <TextField
          value={targetBalance}
          fullWidth
          size='small'
          onChange={(ev) => setTargetBalance(ev.target.value)}
          label={'amount of tokens'}
          variant='outlined'
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <UnitConverter onResult={setTargetBalance} />
                </InputAdornment>
              </>
            )
          }}
        />
      </Box>
      <Box sx={{ flex: 2, flexGrow: 4 }}>
        <ButtonGroup size='large' sx={{ mt: 2 }} variant='outlined' fullWidth>
          <Button onClick={withdrawTo}>
            WITHDRAW {targetBalance.shiftedBy(-decimals)} {symbol2}
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  )
}

export default WithdrawToBox
