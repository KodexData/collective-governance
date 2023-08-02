import type { Proposal } from 'types'
import * as Hooks from 'hooks'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SxBox from 'components/customs/SxBox'
import RTBox from 'components/customs/RTBox'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

interface VoteStatusBoxProps {
  item: Proposal
}

const VoteStatusBox: React.FC<VoteStatusBoxProps> = ({ item }) => {
  const { t } = useTranslation()
  const voterDetails = Hooks.useVoterDetails(item.id)
  const { forVotes, againstVotes, abstainVotes } = Hooks.useCountVotedWeights(item.id)

  const isPositive = useMemo(() => {
    return forVotes.gt(againstVotes)
  }, [forVotes, againstVotes])

  return (
    <SxBox sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
      {voterDetails && (
        <RTBox>
          <Chip label={`${t('Voters').toUpperCase()}: ${voterDetails.length}`} size={'small'} />
        </RTBox>
      )}
      <Typography align='center' variant='h4' sx={{ pt: 2, flex: 1, flexBasis: '50%', maxHeight: '50%' }} noWrap>
        <ThumbUpIcon color='success' sx={{ fontSize: isPositive ? 64 : 48 }} /> <br />
        {forVotes.toString().shiftedBy(-18).prettyNum()}
      </Typography>
      <Divider />
      <Tooltip title={`${t('Abstain Votes')}: ${abstainVotes}`}>
        <Typography align='center' variant='h4' sx={{ pt: 2, flex: 1, maxHeight: '50%' }} noWrap>
          <ThumbDownIcon color='error' sx={{ fontSize: !isPositive ? 64 : 48 }} /> <br />
          {againstVotes.toString().shiftedBy(-18).prettyNum()}
        </Typography>
      </Tooltip>
    </SxBox>
  )
}

export default VoteStatusBox
