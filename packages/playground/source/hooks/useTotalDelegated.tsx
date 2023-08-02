import { useMemo, useContext } from 'react'
import { CtxState } from 'context'
import { BigNumber } from '@ethersproject/bignumber'
import { uniqBy } from 'lodash'

/**
 * Calculates the total number of tokens delegated to the Governance contract.
 * @date 27.4.2023 - 00:35:29
 *
 * @export
 * @returns {string | undefined} The total number of tokens delegated, or undefined if state is not yet loaded.
 */
export default function useTotalDelegated(): string | undefined {
  const { state } = useContext(CtxState)
  return useMemo(() => {
    if (!state.delegators || !state.tokenInfo) return
    const unique = uniqBy(state.delegators, 'delegator')
    const result = unique.reduce((t, d) => t.add(d.votes), BigNumber.from(0))
    return result.toString().shiftedBy(-state.tokenInfo.decimals)
  }, [state.proposalStateHash, state.delegators, state.tokenInfo])
}
