import useVoterDetails from './useVoterDetails'
import { useMemo } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

export interface VotesBigNumber {
  againstVotes: BigNumber
  forVotes: BigNumber
  abstainVotes: BigNumber
}

/**
 * A custom hook that returns the total weight of votes for/against/abstain for a given proposal.
 * @date 26.4.2023 - 23:57:00
 *
 * @export
 * @param {string | BigNumber} id - The ID of the proposal to count the voted weights for.
 * @returns {VotesBigNumber} An object containing the total weight of votes for/against/abstain.
 */
export default function useCountVotedWeights(id: string | BigNumber): VotesBigNumber {
  const voterDetails = useVoterDetails(id)
  return useMemo(() => {
    const againstVotes = voterDetails.reduce<BigNumber>((acc, item) => {
      if (item.support === 0) return acc.add(BigNumber.from(item.weight))
      return acc
    }, BigNumber.from(0))

    const forVotes = voterDetails.reduce<BigNumber>((acc, item) => {
      if (item.support === 1) return acc.add(BigNumber.from(item.weight))
      return acc
    }, BigNumber.from(0))

    const abstainVotes = voterDetails.reduce<BigNumber>((acc, item) => {
      if (item.support === 2) return acc.add(BigNumber.from(item.weight))
      return acc
    }, BigNumber.from(0))

    return { againstVotes, forVotes, abstainVotes }
  }, [id, voterDetails])
}
