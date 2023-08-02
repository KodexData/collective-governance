import type { QuorumReachedState } from 'types'
import { useContext, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { CtxState } from 'context'
import { calcQuorumWeight } from '@collective-governance/api-evm'

/**
 * A custom hook that returns the state of whether the quorum for a given proposal has been reached or not.
 * @date 26.4.2023 - 23:16:45
 *
 * @export
 * @param {(string | BigNumber)} id - The unique identifier of the proposal.
 * @returns {QuorumReachedState} The state of whether the quorum for the proposal has been reached or not.
 */
export default function useQuorumReached(id: string | BigNumber): QuorumReachedState {
  const { state } = useContext(CtxState)

  return useMemo(() => {
    if (!state.governorInformation?.mode) return {}
    if (!state || !state.quorum) return {}
    const p = state.proposals[id.toString()]

    if (!p.quorum) {
      if (state.quorum) {
        p.quorum = BigNumber.from(state.quorum)
      } else return {}
    }

    return calcQuorumWeight(p)
  }, [state.proposalStateHash, state.quorum, state.governorInformation])
}
