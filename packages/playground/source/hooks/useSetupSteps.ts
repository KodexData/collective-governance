import { useEffect, useMemo } from 'react'
import { useApplication, useLinkParams } from '.'

/**
 * Custom hook to determine the current step in the setup process
 * @date 27.4.2023 - 00:31:00
 *
 * @export
 * @returns {(1 | 0 | 2)} The current step index (0 = abstain, 1 = for, 2 = against)
 */
export default function useSetupSteps(): 1 | 0 | 2 {
  const { navigate, context, ethers: { state }} = useApplication()
  const setup = useLinkParams()
  
  const active = useMemo(() => {
    if (!setup.chainId || !state.chainId || state.chainId !== setup.chainId) return 0
    if (!setup.contract || setup.contract !== context.state.contracts.Governance) return 1
    return 2
  }, [setup.chainId, state.chainId, setup.contract, context.state.contracts.Governance])

  useEffect(() => {
    if (active === 2 && setup.id) {
      navigate(`/proposal/${setup.id}`)
    }
  }, [active])

  return active
}