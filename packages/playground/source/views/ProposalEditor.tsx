import CreateProposal from 'components/proposal-editor/CreateProposal'
import Collapse from '@mui/material/Collapse'

const ProposalEditor: React.FC = (props) => {
  return (
    <>
      <Collapse in={true} timeout={666}>
        <CreateProposal />
      </Collapse>
    </>
  )
}

export default ProposalEditor
