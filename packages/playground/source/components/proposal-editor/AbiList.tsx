import type { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'react-i18next'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Box from '@mui/material/Box'

interface AbiListProps {
  value: string
  onChange: (ev: SelectChangeEvent<string>) => void
}

const AbiList: React.FC<AbiListProps> = (props) => {
  const { t } = useTranslation()
  return (
    <Box sx={{ minWidth: 120, mb: 2 }}>
      <FormControl fullWidth>
        <InputLabel id='select-default-abi-label'>{t('Select Default ABI')}</InputLabel>
        <Select
          labelId='select-default-abi-label'
          id='select-default-abi'
          value={props.value}
          label={t('Select Default ABI')}
          onChange={props.onChange}
        >
          <MenuItem value='DaoToken'>DaoToken</MenuItem>
          <MenuItem value='Governance'>Governance</MenuItem>
          <MenuItem value='TimelockController'>TimelockController</MenuItem>
          <MenuItem value='Treasury'>Treasury</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}

export default AbiList
