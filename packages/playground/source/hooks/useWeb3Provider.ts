import { useContext, useMemo } from 'react'
import { CtxEthers } from 'context'
import { Web3Provider } from '@ethersproject/providers'

/**
 * A hook that returns an instance of Web3Provider from the injected Ethereum provider
 * @date 27.4.2023 - 00:45:00
 *
 * @export
 * @returns {Web3Provider} - An instance of Web3Provider or undefined if not available
 */
export default function useWeb3Provider(): Web3Provider | undefined {
  const { state } = useContext(CtxEthers)
  return useMemo(() => {
    if (!state.chainId || state.noInjectedProvider) return
    return new Web3Provider(window.ethereum as any)
  }, [state.chainId, state.noInjectedProvider])
}
