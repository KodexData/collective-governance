import type * as T from 'types'
import { useApplication, useErrorHandler } from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { Markdown, JsonBox, toSolidityBlock } from './Markdown'
import { resultToObject } from '@kodex-data/multicall'
import { Contract } from '@ethersproject/contracts'
import DarkModal from './DarkModal'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

interface ContractBoxProps {
  element?: React.ReactNode
  address: string
  abi: T.JsonFragment | T.FunctionFragment | Record<string, any>
  children?: React.ReactNode
  sx?: T.SxProps
}

interface AbiDetails {
  jsonInterface: string
  interface: string
  signature: string
  signatureHash: string
}

const ContractBox: React.FC<ContractBoxProps> = ({ abi, address, ...props }) => {
  const { handleError } = useErrorHandler()
  const { ethers, snackbar } = useApplication()
  const [parameters, setParameters] = useState<Record<number, string>>({})
  const [callResult, setCallResult] = useState<string>()
  const [open, setOpen] = useState(false)

  function handleClose() {
    setOpen(false)
  }

  function handleOpen() {
    setOpen(true)
  }

  async function handleCall() {
    const provider = ethers.provider?.getSigner() || ethers.provider
    const contract = new Contract(address, [abi], provider)

    try {
      const overrides: T.CallOverrides = {}

      if (['payable', 'nonpayable'].includes(abi.stateMutability)) {
        const estimate = Object.values(contract.estimateGas)[0]
        const gasLimit = await estimate(...Object.values(parameters))
        overrides.gasLimit = gasLimit
        snackbar.enqueueSnackbar(`estimated gas: ${gasLimit}`)
      }
      
      const response = await contract[abi.name](...Object.values(parameters), overrides)
      let result: unknown

      if ((abi.outputs || []).length > 1) {
        result = resultToObject(response)
      } else {
        result = response.toString()
      }
      
      setCallResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setCallResult(undefined)
      handleError(error)
    }
  }

  function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const { value, name } = ev.target
    const index = Number(name)
    const newParameters = { ...parameters }
    newParameters[index] = value
    setParameters(newParameters)
  }

  useEffect(() => {
    if (!open) {
      setCallResult(undefined)
      setParameters({})
    }
  }, [open])


  const details = useMemo<AbiDetails>(() => {
    const contract = new Contract(address, [abi], ethers.provider)
    const inputs = (abi.inputs as T.JsonFragment['inputs']) || []
    const paramTypes = inputs.map((input) => input.type!)
    const fullParamTypes = inputs.map((input) => `${input.type!} ${input.name!}`)

    try {
      let signatureHash!: string
      let signature!: string
      let fragment: T.FunctionFragment | T.EventFragment | T.ErrorFragment | undefined

      switch (abi.type) {
        case 'error':
          fragment = contract.interface.getError(abi.name)
          signatureHash = contract.interface.getSighash(fragment as T.ErrorFragment)
          break
        case 'event':
          fragment = contract.interface.getEvent(abi.name)
          signatureHash = contract.interface.getEventTopic(fragment as T.EventFragment)
          break
        case 'function':
          fragment = contract.interface.getFunction(abi.name)
          signatureHash = contract.interface.getSighash(fragment as T.FunctionFragment)
          break
        case 'constructor':
          signature = `constructor(${paramTypes.join(',')})`
          return {
            interface: `constructor(${fullParamTypes.join(', ')})`,
            signature: signature,
            signatureHash: signature.toSha3().slice(0, 10),
            jsonInterface: JSON.stringify(abi)
          } as AbiDetails
        case 'receive':
          signature = `receive(${paramTypes.join(',')})`
          return {
            interface: `receive(${fullParamTypes.join(', ')})`,
            signature: signature,
            signatureHash: signature.toSha3().slice(0, 10),
            jsonInterface: JSON.stringify(abi)
          } as AbiDetails
        default:
          try {
            fragment = contract.interface.getFunction(abi.name)
            signatureHash = contract.interface.getSighash(abi.name)
          } catch (error) {}
      }

      if (typeof fragment === 'undefined') return {} as AbiDetails

      const result = {
        jsonInterface: fragment.format('json'),
        interface: fragment.format('full'),
        signature: fragment.format(),
        signatureHash
      }

      return result
    } catch (error) {
      const { message } = error as Error
      snackbar.enqueueSnackbar(`${abi.name}: ${message}`, { variant: 'warning' })
      return {} as AbiDetails
    }
  }, [ethers.provider, abi, address])

  const inputs = useMemo(() => {
    const { inputs } = abi as T.JsonFragment
    return inputs || []
  }, [address, abi])

  const element = useMemo(() => {
    if (props.element) return props.element
    return (
      <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
        <Card
          variant='outlined'
          sx={{ p: 2, cursor: 'pointer', borderRadius: 2, background: 'transparent' }}
          onClick={handleOpen}
        >
          <Stack direction='row' spacing={2}>
            <Chip variant='outlined' color='info' label={abi.type} size='small' />
            <Typography variant='h4' textAlign='left' sx={{ flexGrow: 10, mb: 0 }} noWrap>
              {details.signature || abi.name}
            </Typography>
            {abi.stateMutability && (
              <Chip
                variant='outlined'
                color={abi.stateMutability === 'view' ? 'success' : 'error'}
                label={abi.stateMutability}
                size='small'
              />
            )}
          </Stack>
        </Card>
      </Grid>
    )
  }, [props.element, abi, details, address])

  return (
    <>
      {element}
      <DarkModal sx={{ height: 'auto' }} open={open} handleClose={handleClose}>
        <Box sx={{ overflowY: 'scroll', maxHeight: '100%', pr: 2, pl: 2 }}>
          <Table size='small' sx={{ mb: 2 }}>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ width: '30%', minWidth: '200px' }}>ABI NAME</TableCell>
                <TableCell sx={{ width: '70%' }}>{abi.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ABI TYPE</TableCell>
                <TableCell>{abi.type}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SIGNATURE</TableCell>
                <TableCell>{details.signature}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SIGNATURE HASH</TableCell>
                <TableCell>{details.signatureHash}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>STATE MUTABILITY</TableCell>
                <TableCell>{abi.stateMutability}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Markdown>{toSolidityBlock(details.interface)}</Markdown>
          <Divider />
          {abi.type === 'function' && inputs.length > 0 && (
            <Typography variant='h6' sx={{ mb: 2 }}>
              INPUT PARAMETERS
            </Typography>
          )}

          {abi.type === 'function' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={callResult ? 6 : 12} xl={callResult ? 6 : 12}>
                {inputs.map((input, index) => {
                  const label = `${input.name} (${input.type})`
                  const id = `${index}:${label}`.toSha3()
                  return (
                    <Box key={id} sx={{ mb: 2 }}>
                      <TextField
                        sx={{ marginTop: 0 }}
                        name={String(index)}
                        value={parameters[index] || ''}
                        onChange={handleChange}
                        label={label}
                        variant='outlined'
                        fullWidth
                        size='small'
                      />
                    </Box>
                  )
                })}
                <Button onClick={handleCall} variant='outlined' color='success' fullWidth>
                  CALL CONTRACT METHOD
                </Button>
              </Grid>
              {callResult && (
                <Grid item xs={12} sm={12} md={12} lg={6} xl={6}>
                  <JsonBox code={callResult} style={{ margin: 0 }} />
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </DarkModal>
    </>
  )
}

export default ContractBox
