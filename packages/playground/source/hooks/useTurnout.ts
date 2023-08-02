import type { Proposal } from 'types'
import { useContext, useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { CtxState } from 'context'
import BigNumberJS from 'bignumber.js'

/**
 * Calculates the voter turnout for a given proposal or proposal ID.
 * @date 27.4.2023 - 00:39:08
 *
 * @export
 * @param {(Proposal | BigNumber | string)} input - The proposal or proposal ID.
 * @returns {(BigNumberJS | undefined)} - The voter turnout percentage, or undefined if the necessary data is not available.
 */
export default function useTurnout(input: Proposal | BigNumber | string): BigNumberJS | undefined {
  const ZERO = BigNumber.from(0)
  const { state } = useContext(CtxState)

  return useMemo(() => {
    if (!state.tokenInfo || !state.delegators) return
    if (input instanceof BigNumber || typeof input === 'string') {
      if (!state.proposals[input.toString()]) return
      input = state.proposals[input.toString()]
    }

    const { abstainVotes, againstVotes, forVotes } = input
    const allVotes = abstainVotes.concat(againstVotes).concat(forVotes)
    const totalVotes = allVotes
      .reduce<BigNumber>((acc, { weight }) => {
        return acc.add(BigNumber.from(weight))
      }, ZERO)
      .toString()
      .toBN()

    const pastTotalSupply = input.pastTotalSupply?.toString().toBN() || '0'.toBN()
    const totalDelegated = state.delegators
      .reduce((t, d) => t.add(d.votes), ZERO)
      .toString()
      .toBN()

    const divisor = pastTotalSupply.isLessThanOrEqualTo(totalDelegated) ? pastTotalSupply : totalDelegated
    const result = totalVotes.dividedBy(divisor)

    if (result.isGreaterThan(1)) return '100'.toBN()
    if (result.isLessThan(0)) return '0'.toBN()

    return result.shiftedBy(2)
  }, [state.proposalStateHash, input, state.tokenInfo, state.delegators])
}
