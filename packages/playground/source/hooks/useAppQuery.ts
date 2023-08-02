import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useInterval } from '@kodex-react/ctx-ethers'

export interface ContractDescription {
  contract: string
  chainId: number
}

/**
 * parses additional query strings to predefine chainId and contract.
 * @date 1/20/2023 - 1:21:12 AM
 *
 * @export
 * @returns {Partial<ContractDescription>}
 */
export default function useAppQuery(): Partial<ContractDescription> {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState<string>()
  const [ticks, setTicks] = useState(0)

  const { start, stop } = useInterval(() => {
    if (search !== window.location.search && window.location.search !== '') {
      setSearch(window.location.search)
      stop()
    }
    if (ticks === 10) {
      stop()
      setTicks(0)
    }
    setTicks(ticks + 1)
  }, 100, true)

  useEffect(() => start(), [location.key])

  return useMemo(() => {
    const params = new URLSearchParams(search)
    const chainId = params.get('chainId')
    const chainIdOk = chainId && chainId.isNumber()

    const contract = params.get('contract')
    const contractOk = contract && contract.isAddress()

    return <Partial<ContractDescription>>{
      contract: contractOk ? contract.toChecksumAddress() : undefined,
      chainId: chainIdOk ? Number(chainId) : undefined
    }
  }, [search, location.key])
}
