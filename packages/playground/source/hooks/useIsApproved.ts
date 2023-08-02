import { useCallback, useEffect, useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useApplication from './useApplication'

type UseIsApproved = {
  isAllowed: boolean
  approve: (amount?: string) => Promise<BigNumber | undefined>
  value: BigNumber
}

/**
 * Hook that returns the approval status of a token and allows for approving an amount of tokens.
 * @date 27.4.2023 - 00:13:29
 * @note unused
 *
 * @export
 * @param {?string} [tokenAddress] The address of the token to check approval status for
 * @returns {UseIsApproved} containing approval status, approve function, and allowance value
 */
export default function useIsApproved(tokenAddress?: string): UseIsApproved {
  const { ethers: { state, provider }, governance, snackbar } = useApplication()
  const [isAllowed, setIsAllowed] = useState(false)
  const [value, setValue] = useState(BigNumber.from(0))

  const allowance = useCallback(
    async (addr = tokenAddress) => {
      if (!state.address || !addr) return
      const d = governance.getDaoToken(addr)!
      const allowance = await d.allowance(addr, state.address)
      setValue(allowance)
      setIsAllowed(allowance.gt(0))
      return allowance
    },
    [state.address, tokenAddress, governance]
  )

  const approve = useCallback(
    async (amount?: string) => {
      if (!state.address || !tokenAddress || !provider) return
      const spender = await provider.getSigner().getAddress()
      const d = governance.getDaoToken(tokenAddress)!
      const balance = await d.balanceOf(spender)
      const receipt = await d.approve(spender, balance).then((tx) => tx.wait())
      const approvalEvent = receipt.events?.find((e) => e.event === 'Approval')
      if (!approvalEvent) {
        snackbar.enqueueSnackbar(`error approving contract - no event returned`, { variant: 'warning' })
        return
      }

      return await allowance()
    },
    [state.address, tokenAddress, provider, governance, snackbar, allowance]
  )

  useEffect(() => {
    if (!state.address || !tokenAddress) return
    allowance()
  }, [state.address, tokenAddress, allowance])

  return useMemo(() => {
    return { isAllowed, approve, value }
  }, [isAllowed, approve, value])
}
