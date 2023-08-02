import { useCallback } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useApplication from './useApplication'

/**
 * A custom hook that calculates the number of blocks left until a given deadline.
 * @date 26.4.2023 - 23:38:43
 *
 * @export
 * @param {(number | BigNumber)} deadline - The deadline until which the number of blocks left should be calculated.
 * @returns {number | undefined} The number of blocks left until the given deadline or `undefined` if the required information is not available.
 */
export default function useBlocksLeft(deadline: number | BigNumber): number | undefined {
  const { ethers: { state } } = useApplication()
  const calculateBlocksLeft = useCallback(() => {
    if (!state.blockNumber) return
    const deadlineInt = deadline instanceof BigNumber ? deadline.toNumber() : deadline
    let blksLeft = deadlineInt - state.blockNumber
    if (blksLeft < 0) blksLeft = 0
    return blksLeft
  }, [deadline, state.blockNumber])

  return calculateBlocksLeft()
}
