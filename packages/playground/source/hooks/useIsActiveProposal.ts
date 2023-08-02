import { useMemo, useContext } from 'react'
import { CtxState } from 'context'
import { BigNumber } from '@ethersproject/bignumber'

type IsActiveProposal = Partial<{
  isActive: boolean
  error?: boolean
  message?: string
}>

/**
 * A custom hook that checks if a proposal is currently active or not.
 * @date 26.4.2023 - 23:24:37
 *
 * @export
 * @param {(string | BigNumber)} proposalId - The unique identifier of the proposal.
 * @returns {boolean|undefined} A boolean value indicating if the proposal is active or undefined if the proposal does not exist.
 */

export default function useIsActiveProposal(proposalId: string | BigNumber): IsActiveProposal {
  const { state } = useContext(CtxState)
  return useMemo(() => {
    try {
      const p = state.proposals[proposalId.toString()]
      if (!p) {
        throw new Error('Proposal does not exist')
      }
      return { isActive: p.status === 1 }
    } catch (err) {
      const { message } = err as Error
      return { error: true, message }
    }
  }, [state.proposalStateHash, proposalId])
}
