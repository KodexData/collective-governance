import { useContext, useEffect, useMemo, useState } from 'react'
import { CtxGovernance, CtxState } from 'context'
import { useHideSidebar, useProposal } from 'hooks'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash'
import VotingInformation from 'components/voting/VotingInformation'
import OperatorButtons from 'components/proposals/OperatorButtons'
import VotingButtons from 'components/voting/VotingButtons'
import Collapse from '@mui/material/Collapse'
import SxCard from 'components/customs/SxCard'

const ProposalViewer: React.FC = () => {
  const { state } = useContext(CtxState)
  const params = useParams<{ id: string }>()
  const governance = useContext(CtxGovernance)
  const proposal = useProposal(params.id)

  const noProposals = useMemo(() => {
    return isEmpty(state.proposals)
  }, [state.chainId, state.proposalStateHash])

  const show = useMemo(() => Boolean(!noProposals && proposal), [noProposals, proposal])

  useEffect(() => {
    if (noProposals) {
      const address = governance.getDefaultAddress()
      if (address) governance.initialize(address, 'ProposalViewer.tsx')
    }
  }, [noProposals])

  if (!params.id) return <>NO ID PROVIDED</>
  if (!proposal) return <>APPLICATION LOADING</>

  return (
    <Collapse in={show} timeout={666 * 2}>
      <SxCard sx={{ pt: 0 }}>
        <VotingInformation item={proposal} showDescription showPaper showStatusChip>
          <VotingButtons id={proposal.id} />
        </VotingInformation>
      </SxCard>
      <OperatorButtons {...proposal} />
    </Collapse>
  )
}

export default ProposalViewer
