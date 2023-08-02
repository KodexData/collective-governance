import type * as T from 'types'
import type { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'

interface AbiMethodBoxProps {
  abis?: T.FunctionFragment[] | T.JsonFragment[] | null
  selectedIndex?: number
  handleChange: (event: SelectChangeEvent<number>) => void
}

function toSignature(abi: T.FunctionFragment | T.JsonFragment) {
  return `${abi.name}(${abi.inputs!.map((x) => x.type).join(',')})`
}

const AbiMethodBox: React.FC<AbiMethodBoxProps> = ({ abis, selectedIndex, handleChange }) => {
  const { t } = useTranslation()
  const items = useMemo(() => {
    if (!abis) return
    return abis.map((abi, i) => {
      if (abi.type === 'function' && ['payable', 'nonpayable'].includes(abi.stateMutability!)) {
        return (
          <MenuItem value={i} key={`method_${abi.name}_${i}`}>
            {toSignature(abi)}
          </MenuItem>
        )
      }
      return null
    })
  }, [abis])

  if (!abis || !items) return <></>

  return (
    <>
      <Box sx={{ minWidth: 120, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id='abi-method-select-label'>
            {t('Select Contract Method')}
          </InputLabel>
          <Select
            labelId='abi-method-select-label'
            id='abi-method-select'
            value={selectedIndex}
            label={t('Select Contract Method')}
            onChange={handleChange}
          >
            {items}
          </Select>
        </FormControl>
      </Box>
    </>
  )
}

export default AbiMethodBox
