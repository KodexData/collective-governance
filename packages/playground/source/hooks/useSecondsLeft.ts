import { useMemo, useContext } from 'react'
import { CtxEthers } from 'context'

/**
 * Calculates the number of seconds left for a given number of Ethereum blocks
 * to be mined, based on the current block time from the Ethereum network.
 * @date 27.4.2023 - 00:29:11
 *
 * @export
 * @param {?number} [blocksLeft] - The number of blocks left to be mined
 * @returns {number | undefined} The number of seconds left until the blocks are mined
 */
export default function useSecondsLeft(blocksLeft?: number): number | undefined {
  const { state } = useContext(CtxEthers)
  return useMemo(() => {
    if (!blocksLeft || !state.blockTime) return
    return Math.ceil(blocksLeft * state.blockTime!)
  }, [blocksLeft, state.blockTime])
}