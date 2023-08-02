import type { Proposal, SxProps } from 'types'
import { useApplication, useInterval, useStartsIn } from 'hooks'
import { useMemo } from 'react'
import SxCard from 'components/customs/SxCard'
import StatusChip from 'components/customs/StatusChip'
import VotingButtons from 'components/voting/VotingButtons'
import VotingInformation from 'components/voting/VotingInformation'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'

interface ActiveProposalMainProps {
  showDescription?: boolean
  hideDetails?: boolean
  sx?: SxProps
}

const ActiveProposals: React.FC<Proposal & ActiveProposalMainProps> = (item) => {
  const startsIn = useStartsIn(item)

  return (
    <SxCard>
      <Typography align='left' component='div'>
        <StatusChip status={item.status} />
        <Chip label={`BLOCK: ${item.blockNumber}`} color={'info'} size='small' variant='outlined' sx={{ ml: 1 }} />
        {item.status === 0 && startsIn && (
          <>
            <Chip label={`STARTs IN: ${startsIn}`} color={'default'} size='small' variant='outlined' sx={{ ml: 1 }} />
          </>
        )}
        <Chip label={`${item.headline}`} color={'default'} size='small' variant='outlined' sx={{ ml: 1 }} />
      </Typography>
      <VotingInformation item={item} hideDetails={item.hideDetails} showDescription={item.showDescription}>
        {item.status < 2 && <VotingButtons id={item.id} />}
      </VotingInformation>
    </SxCard>
  )
}

const DrawProposals: React.FC<ActiveProposalMainProps> = (props) => {
  const { context: { state, getActiveProposals }, update } = useApplication()

  const elements = useMemo(() => {
    const proposals = getActiveProposals().filter((_, x) => (!props.hideDetails ? x > 0 : x >= 0))
    return proposals.map((item, i) => (
      <Grid key={`active_proposal_${item.id}_${i}`} item sm={12} xs={12} md={12} lg={12} xl={12}>
        <ActiveProposals {...item} showDescription={props.showDescription} hideDetails={props.hideDetails} />
      </Grid>
    ))
  }, [state.proposalStateHash])

  useInterval(() => {
    update()
  }, 500)

  return (
    <Grid container spacing={2.5} sx={{ ...props.sx }}>
      {elements}
    </Grid>
  )
}

export default DrawProposals
