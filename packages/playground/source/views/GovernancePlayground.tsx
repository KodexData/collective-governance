import DrawProposals from 'components/proposals/ActiveProposals'
import ProposalGrid from 'components/proposals/ProposalGrid'
import Collapse from '@mui/material/Collapse'
import Box from '@mui/material/Box'

const GovernancePlayground: React.FC = (props) => {
  return (
    <>
      <Collapse in={true} timeout={666}>
        <Box>
          <DrawProposals hideDetails sx={{ mb: 1.5 }} />
          <ProposalGrid />
        </Box>
      </Collapse>
    </>
  )
}

export default GovernancePlayground
