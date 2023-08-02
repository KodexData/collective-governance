import type * as T from 'types'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import type { FnParameters, TknInfo } from '@collective-governance/api-evm/types'
import type { SelectChangeEvent } from '@mui/material/Select'
import { DaoWrapped__factory } from '@collective-governance/hardhat'
import { useEffect, useMemo, useState } from 'react'
import { useApplication } from 'hooks'
import UnitConverter from 'components/proposal-editor/UnitConverter'
import AddressBook from 'components/address-book/AddressBook'
import JsonAlertBox from './JsonAlertBox'
import ReceiptBox from './ReceiptBox'
import JazzIcon from './JazzIcon'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import ButtonGroup from '@mui/material/ButtonGroup'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import Box from '@mui/system/Box'

const iface = DaoWrapped__factory.createInterface()
const actions = {
  approve: iface.getFunction('approve'),
  increaseAllowance: iface.getFunction('increaseAllowance'),
  decreaseAllowance: iface.getFunction('decreaseAllowance')
}

type Action = keyof typeof actions

export interface AllowanceResult {
  owner: string
  spender: string
  value: string
}

interface ApprovalBoxProps {
  spenderAddress?: string
  contractAddress?: string
  tknInfo?: TknInfo
  onResult?: (a: AllowanceResult) => void
  hideForm?: boolean
}

function propsToAddress(props: ApprovalBoxProps): string {
  const inp = props.contractAddress || props.tknInfo
  if (!inp) return ''
  if (typeof inp === 'string') {
    if (!inp.isAddress()) return ''
    return inp.toChecksumAddress()
  } else {
    return inp.underlying || ''
  }
}

const ApprovalBox: React.FC<ApprovalBoxProps> = (props) => {
  const [targetAddress, setTargetAddress] = useState<string>(propsToAddress(props))
  const [isValidTarget, setIsValidTarget] = useState(false)
  const [selectedAction, setSelectedAction] = useState<Action>('approve')
  const [parameters, setParameters] = useState<FnParameters>({})
  const [allowance, setAllowance] = useState<AllowanceResult>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()
  const {
    governance,
    ethers: { provider }
  } = useApplication()

  const changeParameter = (i: number, value: string) => {
    const p = { ...parameters }
    p[i] = value
    setParameters(p)
  }

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedAction(event.target.value as Action)
    setParameters({})
  }

  useEffect(() => {
    if (!targetAddress.isAddress()) {
      setIsValidTarget(false)
      return
    }
    governance.isValidERC20(targetAddress).then(setIsValidTarget)
  }, [targetAddress])

  useEffect(() => {
    if (!props.spenderAddress) return
    changeParameter(0, props.spenderAddress)
  }, [props.spenderAddress])

  useEffect(() => {
    if (!props.spenderAddress || !isValidTarget) return
    handleQuery()
  }, [props.spenderAddress, isValidTarget])

  const buttonDisabled = () => {
    if (!isValidTarget || !provider) return true

    for (const index in actions[selectedAction].inputs) {
      if (!parameters[index]) return true
      const param = actions[selectedAction].inputs[index]
      const value: string = parameters[index]
      switch (param.format()) {
        case 'address':
          if (!value.isAddress()) return true
          break
        case 'uint256':
          if (!value.isNumber()) return true
          break
      }
    }
    return false
  }

  async function handleCall() {
    if (!provider || !String(parameters[0]).isAddress()) return
    const signer = provider.getSigner()
    const owner = await signer.getAddress()
    const spender = parameters[0]
    const contract = DaoWrapped__factory.connect(targetAddress, signer)
    const txResponse = await contract[selectedAction](parameters[0], parameters[1])
    setReceipt(await txResponse.wait())

    setAllowance({
      owner,
      spender,
      value: await contract.allowance(owner, spender).then((c) => c.toString())
    })
  }

  async function handleQuery() {
    if (!provider || !String(parameters[0]).isAddress()) return
    const signer = provider.getSigner()
    const owner = await signer.getAddress()
    const spender = parameters[0]
    const contract = DaoWrapped__factory.connect(targetAddress, signer)
    const result = {
      owner: await signer.getAddress(),
      spender: parameters[0],
      value: await contract.allowance(owner, spender).then((c) => c.toString())
    }

    if (props.onResult) props.onResult(result)
    setAllowance(result)
  }

  const inputValueElements = useMemo(() => {
    const action = actions[selectedAction]
    return action.inputs.map((param, i) => {
      return (
        <Box key={`input_${action.name}_${param.format()}`} sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1, flexGrow: 4 }}>
            <TextField
              value={parameters[i] || ''}
              fullWidth
              size='small'
              onChange={(ev) => changeParameter(i, ev.target.value)}
              label={param.name + ' - ' + param.format()}
              variant='outlined'
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position='end'>
                      {param.format() === 'address' ? (
                        <AddressBook onResult={(e) => changeParameter(i, e as any)} />
                      ) : (
                        <UnitConverter onResult={(e) => changeParameter(i, e as any)} />
                      )}
                    </InputAdornment>
                  </>
                )
              }}
            />
          </Box>
        </Box>
      )
    })
  }, [selectedAction, parameters, parameters[0]])

  return (
    <>
      {!props.hideForm && (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1, flexGrow: 4 }}>
              <TextField
                value={targetAddress}
                fullWidth
                size='small'
                onChange={(ev) => setTargetAddress(ev.target.value)}
                label='ERC20 like Contract Address'
                variant='outlined'
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position='end'>
                        {isValidTarget && (
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
            </Box>
            <Box sx={{ flex: 2, textAlign: 'right' }}>
              <Box sx={{ minWidth: 120, mt: 0.5 }}>
                <FormControl fullWidth>
                  <InputLabel id='approval-method-select-label'>Select Approval Method</InputLabel>
                  <Select
                    labelId='approval-method-select-label'
                    id='demo-simple-select'
                    value={selectedAction}
                    size='small'
                    label='Select Approval Method'
                    onChange={handleChange}
                  >
                    {Object.values(actions).map((f, key) => {
                      return <MenuItem value={f.name}>{f.format()}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
          {inputValueElements}
          <ButtonGroup variant='outlined' fullWidth>
            <Button disabled={buttonDisabled()} onClick={handleCall}>
              {selectedAction}
            </Button>
            <Button onClick={handleQuery}>QUERY ALLOWANCE</Button>
          </ButtonGroup>
        </>
      )}

      {allowance && (
        <JsonAlertBox data={allowance} title={`ALLOWANCE ${targetAddress}`} onClickExit={() => {
          setAllowance(undefined)
        }} />
      )}
      
      {receipt && <ReceiptBox receipt={receipt} eventName='Approval(address,address,uint256)' />}
    </>
  )
}

export default ApprovalBox
