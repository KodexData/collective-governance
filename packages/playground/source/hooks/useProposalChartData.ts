import { useContext, useMemo } from 'react'
import { CtxState } from 'context'

export type ProposalChartDataItem = {
  proposalId: string
  blockNumber: number
  headline: string
  for: number
  against: number
  abstain: number
}

function useProposalChartData(): ProposalChartDataItem[] {
  const { state } = useContext(CtxState)

  return useMemo(() => {
    if (!state.proposals) return []
    const all = Object.values(state.proposals)
    const dataSet = all.reduce<ProposalChartDataItem[]>((acc, proposal) => {
      acc.push({
        blockNumber: proposal.blockNumber,
        headline: proposal.headline,
        proposalId: proposal.id,
        for: Number(proposal._forVotes.toString().shiftedBy(-18)),
        against: Number(proposal._againstVotes.toString().shiftedBy(-18)),
        abstain: Number(proposal._abstainVotes.toString().shiftedBy(-18))
      })
      return acc
    }, [])
    return dataSet
  }, [state.proposalStateHash])
}

export default useProposalChartData
