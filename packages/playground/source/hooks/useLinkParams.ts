import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export type LinkParameters = Partial<{
  chainId: number
  contract: string
  id: string
}>

/**
 * A hook that returns the link parameters parsed from the URL.
 * @date 27.4.2023 - 00:18:19
 *
 * @export
 * @returns {LinkParameters} The parsed link parameters.
 */
export default function useLinkParams(): LinkParameters {
  const { chainId, contract, id } = useParams<{
    chainId: string
    contract: string
    id?: string
  }>()

  return useMemo(() => {
    const result: LinkParameters = {}
    if (chainId && chainId.isNumber()) result.chainId = Number(chainId)
    if (contract && contract.isAddress()) result.contract = contract.toChecksumAddress()
    if (id && id.isNumber()) result.id = id
    return result
  }, [id, chainId, contract])
}
