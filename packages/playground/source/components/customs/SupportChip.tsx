import type * as T from 'types'
import type { ChipProps } from '@mui/material/Chip'
import { parseSupport } from '@collective-governance/api-evm'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import Chip from '@mui/material/Chip'

type ColorIndex = {
  [status: number]: ChipProps['color']
}

const SupportChip: React.FC<{ support: T.VoteSupport }> = ({ support }) => {
  const { t, i18n } = useTranslation()

  const name = useMemo(() => {
    switch(parseSupport(support)) {
      case 'For':
        return t('For')
      case 'Against':
        return t('Against')
      case 'Abstain':
        return t('Abstain')
      case 'Comment':
        return t('Comment')
    }
  }, [support, i18n.language])

  const colors: ColorIndex = {
    0: 'error',
    1: 'success',
    2: 'warning',
    3: 'info',
  }

  return <Chip label={name} color={colors[support]} size='small' />
}

export default SupportChip