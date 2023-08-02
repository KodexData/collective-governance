import { useMemo, useContext, useCallback } from 'react'
import { CtxState } from 'context'
import { uniqBy } from 'lodash'

/**
 * Returns the count of unique delegators in the current governance state.
 * @date 27.4.2023 - 00:01:23
 *
 * @export
 * @returns {number | undefined} The count of unique delegators.
 */
export default function useDelegatorCount(): number | undefined {
  const { state } = useContext(CtxState)

  const getUniqueDelegators = useCallback((delegators: typeof state.delegators) => {
    return uniqBy(delegators || [], 'delegator')
  }, [])

  return useMemo(() => {
    const uniqueDelegators = getUniqueDelegators(state.delegators)
    return uniqueDelegators.length
  }, [getUniqueDelegators, state.proposalStateHash, state.delegators])
}