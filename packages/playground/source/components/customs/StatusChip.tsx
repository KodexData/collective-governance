import type * as T from 'types'
import type { ChipProps } from '@mui/material/Chip'
import { useTranslation } from 'react-i18next'
import { parseProposalState } from '@collective-governance/api-evm'
import Chip from '@mui/material/Chip'

type ColorIndex = {
  [status: number]: ChipProps['color']
}

interface IStatusChip extends ChipProps {
  status: T.ProposalStatus
}

const StatusChip: React.FC<IStatusChip> = ({ status, sx, size, ...props }) => {
  const { t } = useTranslation()
  const name = parseProposalState(status)
  const colors: ColorIndex = {
    0: 'warning',
    1: 'success',
    2: 'error',
    3: 'error',
    4: 'success',
    5: 'info',
    6: 'warning',
    7: 'success'
  }

  return <Chip {...props} sx={sx} label={t(name)} color={colors[status]} size={size || 'small'} />
}

export default StatusChip
