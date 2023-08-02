import type { Proposal, ContractReceipt } from 'types'
import { useContext, useMemo, useState } from 'react'
import { FormatBox } from 'components/customs/Markdown'
import { CtxState } from 'context'
import StatusChip from 'components/customs/StatusChip'
import Accordion from '@mui/material/Accordion'
import VotingInformation from 'components/voting/VotingInformation'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'

type ProposalItemProps = {
  item: Proposal
  receipt?: ContractReceipt
}

const ProposalItem: React.FC<ProposalItemProps> = ({ item, receipt }) => {
  const [showJson, setShowJson] = useState(false)
  const { id, blockNumber, status } = item
  const toggle = () => setShowJson(!showJson)

  return (
    <Accordion key={`proposal_${id}`}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${id}-content`} id={`panel-${id}-header`}>
        <Typography align='left'>
          <StatusChip status={status} />
          <Chip label={`BLOCK: ${blockNumber}`} color={'info'} size='small' variant='outlined' sx={{ ml: 1 }} />
          <Chip label={`${item.headline}`} color={'default'} size='small' variant='outlined' sx={{ ml: 1 }} />
        </Typography>
      </AccordionSummary>
      <AccordionDetails onDoubleClick={toggle}>
        <VotingInformation item={item} showDescription />
        {showJson && <FormatBox data={item} format='YAML' className='json-box' />}
        {receipt && showJson && (
          <>
            <Divider />
            <FormatBox data={receipt} format='YAML' />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

const AllProposals: React.FC = () => {
  const { state } = useContext(CtxState)!
  const proposals = useMemo(() => {
    return Object.values(state.proposals).sort((a, b) => b.blockNumber - a.blockNumber)
  }, [state.proposalStateHash])

  if (state.isLoading && Object.keys(proposals).length === 0)
    return (
      <Card>
        <Typography variant='h4' align='center' sx={{ mb: 4 }}>
          Loading Proposals
        </Typography>
        <LinearProgress />
      </Card>
    )

  return (
    <>
      {proposals.map((item, index) => {
        const receipt = state.receipts.find((receipt) => receipt.transactionHash === item.transactionHash)
        return <ProposalItem key={`proposal_view_${item.id}_${index}`} receipt={receipt} item={item} />
      })}
    </>
  )
}

export default AllProposals
