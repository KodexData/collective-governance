import { useCallback, useEffect, useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { isEmpty } from 'lodash'

type ChainId = string | number | BigNumber
type ChainInfo = Partial<AddEthereumChainParameter> | undefined
type UseChainIdNetwork = {
  isLoaded?: boolean
  result?: ChainInfo
  refetch: () => Promise<void>
  findChain: (identifier?: ChainId) => ChainInfo
}

/**
 * Custom hook to get information about a specific chain ID, or to fetch a list of all chain IDs.
 * @date 26.4.2023 - 23:46:26
 *
 * @export
 * @param {?ChainId} [chainId] - The chain ID to retrieve information for. If omitted, returns information for all chain IDs.
 * @returns {UseChainIdNetwork} - An object containing information about the specified chain ID, or an array of objects containing information about all chain IDs, as well as utility functions for finding and refetching chain information.
 */
export default function useChainIdNetwork(chainId?: ChainId): UseChainIdNetwork {
  const [data, setData] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const cachedResult = useMemo(() => {
    const candidate = findChain(chainId)
    if (!isEmpty(candidate)) return candidate
  }, [chainId])

  const findChain = useCallback(
    (identifier?: string | number | BigNumber) => {
      if (!identifier || !data || !Array.isArray(data)) return {}
      const found = data.find((x) => Number(x.chainId) === BigNumber.from(identifier).toNumber())
      const blockExplorerUrls: string[] = []

      if (!found) return {}

      if (Array.isArray(found.explorers)) {
        for (const { url } of found.explorers) {
          blockExplorerUrls.push(url)
        }
      }

      return {
        chainId: BigNumber.from(identifier).toHexString(),
        chainName: found.name,
        rpcUrls: [found.rpc[0]],
        blockExplorerUrls
      } as ChainInfo
    },
    [data]
  )

  const refetch = useCallback(async () => {
    try {
      const fetchedData = await fetch('https://chainid.network/chains.json').then((response) => response.json())
      setData(fetchedData)
      setIsLoaded(true)
    } catch (error) {
      setIsLoaded(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return useMemo(() => {
    return { result: cachedResult, findChain, refetch, isLoaded }
  }, [cachedResult, findChain, refetch, isLoaded])
}
