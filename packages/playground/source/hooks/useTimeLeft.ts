import { useMemo, useContext } from 'react'
import { CtxEthers } from 'context'

/**
 * Hook to calculate the time left given seconds
 * @date 27.4.2023 - 00:34:19
 *
 * @export
 * @param {number | undefined} secondsLeft - The number of seconds left
 * @returns {string | undefined} The time left formatted as HH:MM:SS or undefined if secondsLeft is falsy or negative
 */
export default function useTimeLeft(secondsLeft?: number): string | undefined {
  const { state } = useContext(CtxEthers)
  return useMemo(() => {
    if (!secondsLeft) return
    if (secondsLeft && secondsLeft > 0) {
      const date = new Date(0)
      date.setSeconds(secondsLeft)
      return date.toISOString().substr(11, 8)
    }
  }, [secondsLeft, state.blockTime])
}
