import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import { DaoWrapped__factory } from '@collective-governance/hardhat'
import { getPermitSignature, Signature } from '@collective-governance/api-evm'
import { CtxWrapped, WrappedTokenState } from './context'
import { useContext, useState } from 'react'
import { useApplication } from 'hooks'
import { MaxUint256 } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import UnitConverter from 'components/proposal-editor/UnitConverter'
import InputAdornment from '@mui/material/InputAdornment'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/system/Box'

const DepositForBox: React.FC<{ permit?: boolean }> = ({ permit }) => {
  const { ethers, snackbar } = useApplication()
  const [targetBalance, setTargetBalance] = useState<string>('')
  const wrapped = useContext(CtxWrapped) as Required<WrappedTokenState>

  async function depositFor() {
    if (!wrapped.contract || !ethers.state.address) return
    const amount = BigNumber.from(targetBalance)
    const contract = DaoWrapped__factory.connect(wrapped.info2.address!, wrapped.contract.signer)

    let sig: Signature | undefined
    let receipt: TransactionReceipt | undefined

    const allowed = await contract.allowance(ethers.state.address, wrapped.contract.address)

    if (amount.gt(allowed)) {
      try {
        sig = await getPermitSignature(wrapped.contract.signer, contract, wrapped.contract.address, targetBalance, MaxUint256)
        receipt = await wrapped.contract.depositForWithPermit(ethers.state.address, amount, MaxUint256, sig.v, sig.r, sig.s).then((t) => t.wait())
      } catch (error) {
        snackbar.enqueueSnackbar(`cannot launch permit function, you need to give allowance manually`)
      }
    } else {
      receipt = await wrapped.contract
      .depositFor(ethers.state.address, amount, {
        gasLimit: 8000000
      })
      .then((t) => t.wait())
    }

    if (receipt) console.log(receipt)

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
      {wrapped.balance1 && (
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
          <Button onClick={depositFor}>
            DEPOSIT {targetBalance.shiftedBy(-decimals)} {symbol2}{permit && ' WITH PERMIT'}
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  )
}

export default DepositForBox
