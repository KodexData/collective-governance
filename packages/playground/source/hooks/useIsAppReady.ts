import { useMemo, useContext } from 'react'
import { CtxState } from 'context'

/**
 * A hook that returns a boolean indicating whether the app is ready.
 * @date 27.4.2023 - 00:05:47
 *
 * @export
 * @returns {boolean} A boolean indicating whether the app is ready.
 */
export default function useIsAppReady(): boolean {
  const { state } = useContext(CtxState)
  return useMemo(() => Boolean(state.isAppReady), [state.proposalStateHash, state.isAppReady])
}