import { useContext, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { CtxState } from 'context'

export type ChartItem = { name: string; value: number }

/**
 * Returns the vote chart data for the given proposal ID.
 * @date 27.4.2023 - 00:40:37
 *
 * @export
 * @param {(string | BigNumber)} proposalId - The ID of the proposal to get vote chart data for.
 * @returns {ChartItem[]} - An array of chart data objects, each containing the name of the vote type and its corresponding value.
 */
export default function useVoteChartData(proposalId: string | BigNumber): ChartItem[] {
  const { state } = useContext(CtxState)

  return useMemo(() => {
    proposalId = proposalId.toString()
    if (!state.proposals || !state.proposals[proposalId]) return []
    const proposal = state.proposals[proposalId]
    const result: ChartItem[] = []

    const forVotes = proposal.forVotes.reduce<BigNumber>((i, p) => {
      if (p.support === 1) return i.add(p.weight)
      return i
    }, BigNumber.from(0))

    const abstainVotes = proposal.abstainVotes.reduce<BigNumber>((i, p) => {
      if (p.support === 2) return i.add(p.weight)
      return i
    }, BigNumber.from(0))

    const againstVotes = proposal.againstVotes.reduce<BigNumber>((i, p) => {
      if (p.support === 0) return i.add(p.weight)
      return i
    }, BigNumber.from(0))

    if (forVotes.gt(0)) result.push({ name: 'For', value: Number(forVotes.toString().shiftedBy(-18)) })
    if (againstVotes.gt(0)) result.push({ name: 'Against', value: Number(againstVotes.toString().shiftedBy(-18)) })
    if (abstainVotes.gt(0)) result.push({ name: 'Abstain', value: Number(abstainVotes.toString().shiftedBy(-18)) })

    return result
  }, [proposalId, state.proposalStateHash])
}
