import type { SelectChangeEvent } from '@mui/material/Select'
import type { JsonFragment } from '@ethersproject/abi/lib/fragments'
import { useEffect, useMemo, useState } from 'react'
import { useApplication, useClipboard } from 'hooks'
import ContractBox from 'components/customs/ContractBox'
import AbiList from 'components/proposal-editor/AbiList'
import InputAdornment from '@mui/material/InputAdornment'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

interface ContractToolingProps {}
type AbiTypes = 'all' | 'function' | 'event' | 'error' | 'constructor' | 'receive'

const ContractTooling: React.FC<ContractToolingProps> = () => {
  const clipboard = useClipboard()
  const { governance, context, snackbar } = useApplication()
  const [abis, setAbis] = useState<JsonFragment[]>()
  const [typeFilter, setTypeFilter] = useState<AbiTypes>('function')
  const [address, setAddress] = useState<string>()
  const [inputAbi, setInputAbi] = useState<string>(JSON.stringify([]))
  const [selectedDefaultAbi, setSelectedDefaultAbi] = useState<string>('Governance')
  const [showAbiInput, setShowAbiInput] = useState(false)
  const { Governance } = context.state.contracts
  const { defaultAbis } = governance

  function handleAddressChange(ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setAddress(ev.target.value)
  }

  function handleABIChange(ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setInputAbi(ev.target.value)
  }

  function handleToggle() {
    setShowAbiInput(!showAbiInput)
  }

  function handleCopy() {
    clipboard.copy(inputAbi, { disableNotification: true })
  }

  function handleUseAbi() {
    if (!inputAbi.isValidJSON()) {
      snackbar.enqueueSnackbar('data input is not valid JSON', { variant: 'error' })
      return
    }
    setAbis(inputAbi.parseJSON())
    setInputAbi(inputAbi)
    handleToggle()
  }

  function handleDefaultChange({ target: { value } }: SelectChangeEvent<string>) {
    const abi = defaultAbis[value as keyof typeof defaultAbis]
    const contractAddress = context.state.contracts[value as keyof typeof context.state.contracts]

    if (Array.isArray(abi)) {
      setInputAbi(JSON.stringify(abi, null, 2))
      setSelectedDefaultAbi(value)
    }

    if (contractAddress && contractAddress.isAddress()) {
      setAddress(contractAddress)
    }
  }

  useEffect(() => {
    if (!defaultAbis || !Governance) return
    const abis = JSON.stringify(defaultAbis.Governance, null, 2)
    setAbis(abis.parseJSON())
    setInputAbi(abis)
    setAddress(Governance)
  }, [defaultAbis, Governance])

  const selected = useMemo(() => {
    if (typeFilter === 'all') return abis || []

    const filtered =
      (abis || []).filter((item) => {
        return item.type === typeFilter
      }) || []

    return filtered
  }, [inputAbi, abis, typeFilter, address])

  if (!abis || !address || !address.isAddress()) return <>
    {!abis && 'NO ABIS'}
    {(!address || !address.isAddress()) && 'INVALID ADDRESS'}
  </>

  return (
    <Box>
      <TextField
        placeholder='Enter valid contract address'
        onChange={handleAddressChange}
        value={address}
        variant='outlined'
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={handleToggle}>
                <ListAltIcon color={showAbiInput ? 'info' : undefined} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Collapse in={showAbiInput} timeout={666}>
        <AbiList value={selectedDefaultAbi} onChange={handleDefaultChange} />
        <TextField
          placeholder='Enter valid contract ABIs'
          onChange={handleABIChange}
          multiline
          maxRows={20}
          minRows={5}
          value={inputAbi}
          variant='outlined'
          fullWidth
        />
        <ButtonGroup>
          <Button onClick={handleCopy}>COPY ABI TO CLIPBOARD</Button>
          <Button onClick={handleUseAbi}>USE ABI</Button>
        </ButtonGroup>
      </Collapse>

      <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
        <Chip label='all' onClick={() => setTypeFilter('all')} />
        <Chip label='function' onClick={() => setTypeFilter('function')} />
        <Chip label='event' onClick={() => setTypeFilter('event')} />
        <Chip label='error' onClick={() => setTypeFilter('error')} />
        <Chip label='receive' onClick={() => setTypeFilter('receive')} />
        <Chip label='constructor' onClick={() => setTypeFilter('constructor')} />
      </Stack>

      <Grid container spacing={2}>
        {selected.map((abi, index) => (
          <ContractBox key={`abi_item_${index}`} address={address} abi={abi} />
        ))}
      </Grid>
    </Box>
  )
}

export default ContractTooling
