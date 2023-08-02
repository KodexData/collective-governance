import type { Proposal } from 'types'
import * as Hooks from 'hooks'
import Typography from '@mui/material/Typography'
import SxBox from 'components/customs/SxBox'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import PercentIcon from '@mui/icons-material/Percent'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useTranslation } from 'react-i18next'

interface VoteStartBoxProps {
  item: Proposal
  blocksLeft?: number
  timeLeft?: string
}

const QuorumBox: React.FC<VoteStartBoxProps> = ({ item, blocksLeft, timeLeft }) => {
  const {t} = useTranslation() 
  const { percent, quorum } = Hooks.useQuorumReached(item.id)
  if (item.status === 0) return <></>

  return (
    <SxBox sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
      <Tooltip title={`${t('Required Quorum')}: ${quorum?.toString().shiftedBy(-18)}`}>
        <Typography align='center' variant='h1' sx={{ pt: 2, flex: 1, flexBasis: '50%', maxHeight: '50%' }} noWrap>
          <PercentIcon sx={{ fontSize: 64 }} /> <br />
          {percent}
        </Typography>
      </Tooltip>
      <Divider />
      <Tooltip title={`${t('Blocks until the end of voting')}: ${blocksLeft}`}>
        <Typography align='center' variant='h4' sx={{ pt: 2, flex: 1, maxHeight: '50%' }} noWrap>
          <AccessTimeIcon sx={{ fontSize: 64 }} /> <br />
          {timeLeft || 0}
        </Typography>
      </Tooltip>
    </SxBox>
  )
}

export default QuorumBox