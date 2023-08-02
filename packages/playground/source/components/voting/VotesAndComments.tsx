import type { SxProps, VoteDetail } from 'types'
import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useComments, useVoterDetails } from 'hooks'
import { MarkdownArea } from 'components/customs/Markdown'
import SupportChip from 'components/customs/SupportChip'
import JazzIcon from 'components/customs/JazzIcon'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import Chip from '@mui/material/Chip'

const VoteCommentItem: React.FC<VoteDetail> = (props) => {
  const { t } = useTranslation()
  return (
    <ListItem alignItems='flex-start'>
      <ListItemAvatar>
        <Avatar alt='Voter'>
          <JazzIcon value={props.voter} size={60} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            <SupportChip support={props.support} />
            <Chip label={props.voter} size={'small'} sx={{ ml: 1 }} />
          </>
        }
        primaryTypographyProps={{
          component: 'div',
          sx: { mb: 1 }
        }}
        secondaryTypographyProps={{
          component: 'div'
        }}
        secondary={
          <>
            {props.support !== 3 && `${props.weight.prettyNum()} ${t('Votes')}`}
            {props.reason && (
              <>
                <Divider />
                <Typography component='div' variant='body2' color='text.primary'>
                  <MarkdownArea p={0.1} className='proposal-comment'>
                    {props.reason}
                  </MarkdownArea>
                </Typography>
              </>
            )}
          </>
        }
      />
    </ListItem>
  )
}

interface VotesAndCommentsProps {
  id: string | BigNumber
  sx?: SxProps
}

const VotesAndComments: React.FC<VotesAndCommentsProps> = ({ id, sx }) => {
  const { t, i18n } = useTranslation()
  const votes = useVoterDetails(id)
  const { getComments } = useComments(id)

  const elements = useMemo(() => {
    const data = (getComments() || [])
      .map((comment) => {
        return {
          block: comment.blockNumber,
          txHash: comment.transactionHash,
          support: 3,
          reason: comment.message,
          voter: comment.member,
          weight: '0'
        } as VoteDetail
      })
      .concat(votes)
      .sort((a, b) => b.block - a.block)

    const items = data.map((v) => <VoteCommentItem key={`vote_${v.txHash}_${v.voter}`} {...v} />)

    return <>{items}</>
  }, [votes, i18n.language])

  return <List sx={{ width: '100%', maxHeight: '600px', overflowY: 'auto', ...sx }}>{elements}</List>
}

export default VotesAndComments
