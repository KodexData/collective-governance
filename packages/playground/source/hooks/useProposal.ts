import type { Proposal } from 'types'
import { useMemo, useContext } from 'react'
import { CtxState } from 'context'
import { BigNumber } from '@ethersproject/bignumber'

/**
 * Returns the proposal object for a given proposal ID from the global state.
 * @date 27.4.2023 - 00:27:33
 *
 * @export
 * @param {?(string | BigNumber)} [proposalId] - The ID of the proposal to get.
 * @returns {Proposal} - The proposal object or undefined if not found.
 */
export default function useProposal(proposalId?: string | BigNumber): Proposal | undefined {
  const { state } = useContext(CtxState)
  return useMemo(() => {
    if (!proposalId) return
    if (state.proposals[proposalId.toString()]) {
      return state.proposals[proposalId.toString()]
    }
  }, [state.proposalStateHash, proposalId])
}
