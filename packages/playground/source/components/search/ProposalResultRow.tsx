import type { Proposal } from 'types'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import VotingResultChart from './VotingResultChart'
import StatusChip from 'components/customs/StatusChip'
import JazzIcon from 'components/customs/JazzIcon'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'

type ProposalResultRowProps = { noDivider?: boolean; handleClose?: Function } & Proposal

const ProposalResultRow: React.FC<ProposalResultRowProps> = (props) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { headline, blockNumber, status, id, descriptionHash, transactionHash } = props
  const votes = [...props.forVotes, ...props.abstainVotes, ...props.againstVotes]
  const commentCount = votes.filter((x) => x.reason && x.reason !== '').length + (props.comments || []).length
  const handleDoubleClick = () => navigate(`/editor/${id}`)
  return (
    <>
      <ListItem onDoubleClick={handleDoubleClick} button component='a' alignItems='flex-start'>
        <ListItemAvatar sx={{ mr: 2 }}>
          <JazzIcon value={id} size={68} />
          <br />
          <StatusChip status={status} />
        </ListItemAvatar>
        <ListItemText
          primary={headline}
          secondary={
            <>
              <Typography component='span' variant='body1' color='textPrimary' sx={{ display: 'inline' }}>
                {t('Issued at Block').toUpperCase()} #{blockNumber.toLocaleString()}
                {' - '}
                {t('Votes').toUpperCase()}: {votes.length}
                {' - '}
                {t('Comments').toUpperCase()}: {commentCount}
                <br />
                DESC ID: {descriptionHash} <br />
                TX HASH: {transactionHash} <br />
              </Typography>
            </>
          }
          primaryTypographyProps={{
            variant: 'h2'
          }}
          onClick={() => {
            navigate(`/proposal/${id}`)
            props.handleClose && props.handleClose()
          }}
        />
        <ListItemAvatar sx={{ mr: 0, mt: 0, textAlign: 'right', p: 0 }}>
          <VotingResultChart proposalId={id} height={150} hideLegend />
        </ListItemAvatar>
      </ListItem>
      {!props.noDivider && <Divider variant='inset' component='li' />}
    </>
  )
}

export default ProposalResultRow
