import type { VoteDetail } from '@collective-governance/api-evm/types'
import { useMemo, useContext } from 'react'
import { CtxState } from 'context'
import { BigNumber } from '@ethersproject/bignumber'

/**
 * Retrieves the list of voters for a specific proposal, sorted by the time of the vote.
 * @date 27.4.2023 - 00:43:24
 *
 * @export
 * @param {string | BigNumber} proposalId - The ID of the proposal to retrieve voter details for.
 * @returns {VoteDetail[]} An array of objects representing each voter, sorted by vote time.
 * Each object contains properties `voter` (the address of the voter), `support` (the voter's support value),
 * `weight` (the weight of the voter's support), and `block` (the block number of the vote).
 */
export default function useVoterDetails(proposalId: string | BigNumber): VoteDetail[] {
  const { state } = useContext(CtxState)
  const item = state.proposals[proposalId.toString()]

  return useMemo(() => {
    const { forVotes, abstainVotes, againstVotes } = item
    return forVotes
      .concat(abstainVotes)
      .concat(againstVotes)
      .sort((a, b) => b.block - a.block)
  }, [item, state.proposalStateHash, proposalId])
}