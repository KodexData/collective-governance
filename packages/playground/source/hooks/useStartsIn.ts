import type { Proposal } from 'types'
import { useMemo, useContext, useEffect } from 'react'
import { CtxGovernance, CtxEthers } from 'context'

/**
 * Hook to calculate the time left until a proposal starts
 * @date 27.4.2023 - 00:33:05
 *
 * @export
 * @param {Proposal} item - The proposal object
 * @returns {string | undefined} - The time left until the proposal starts in HH:MM:SS format, or undefined if the proposal has already started
 */
export default function useStartsIn (item: Proposal): string | undefined {
  const { state } = useContext(CtxEthers)
  const governance = useContext(CtxGovernance)

  function getSeconds () {
    const blocksLeft = item.startBlock - state.blockNumber!
    const seconds = blocksLeft * state.blockTime!
    return seconds
  }

  function getStartsIn (seconds: number) {
    // as there is no event between Pending and Active status, we will check on
    // each block if we should refetch the governance state.
    if (seconds <= 0) {
      governance.refetch()
      return
    }

    const date = new Date(0)
    date.setSeconds(seconds)
    return date.toISOString().substring(11, 8)
  }

  useEffect(() => {
    if (item.status !== 1 || !state.blockNumber || !state.blockTime) return
    const seconds = getSeconds()
    getStartsIn(seconds)
  }, [state.blockNumber, state.blockTime])

  return useMemo(() => {
    if (item.status > 0 || !state.blockNumber || !state.blockTime) return
    const seconds = getSeconds()
    return getStartsIn(seconds)
  }, [state.blockNumber, state.blockTime])
}