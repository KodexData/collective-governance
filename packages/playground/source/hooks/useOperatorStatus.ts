import type { Proposal } from 'types'
import { useMemo } from 'react'
import useApplication from './useApplication'

interface OperatorStatus {
  isOperator: boolean | undefined
  isProposer: boolean | undefined
  canQueue: boolean | undefined
  canExecute: boolean | undefined
  canCancel: boolean | undefined
  canPropose: boolean | undefined
  canDelegate: boolean | undefined
  canVote: boolean | undefined
  canReopen: boolean | undefined
}

/**
 * A hook that returns the operator status of the currently connected wallet address.
 * @date 27.4.2023 - 00:25:17
 *
 * @export
 * @param {?Proposal} [item] The proposal item to check operator status against.
 * @returns {OperatorStatus} An object containing the following properties:
 *  - isOperator: a boolean indicating whether the connected wallet is an operator.
 *  - isProposer: a boolean indicating whether the connected wallet is a proposer.
 *  - canQueue: a boolean indicating whether the connected wallet can queue a proposal item.
 *  - canExecute: a boolean indicating whether the connected wallet can execute a proposal item.
 *  - canCancel: a boolean indicating whether the connected wallet can cancel a proposal item.
 *  - canPropose: a boolean indicating whether the connected wallet can propose a new item.
 *  - canDelegate: a boolean indicating whether the connected wallet can delegate voting power.
 *  - canVote: a boolean indicating whether the connected wallet can vote on a proposal.
 *  - canReopen: a boolean indicating whether the connected wallet can reopen a proposal item.
 */
export default function useOperatorStatus(item?: Proposal): OperatorStatus {
  const { ethers, context: { state } } = useApplication()
  const isOperator = useMemo(() => {
    if (!state.userRoles || !ethers.state.address) return
    if (state.userRoles.user.toLowerCase() !== ethers.state.address.toLowerCase()) return
    return state.userRoles.isAdmin || state.userRoles.isExecutor || state.userRoles.isCanceler
  }, [state.userRoles, ethers.state.address])

  const isProposer = useMemo(() => {
    if (!state.userRoles || !ethers.state.address) return
    if (state.userRoles.user.toLowerCase() !== ethers.state.address.toLowerCase()) return
    return state.userRoles.isAdmin || state.userRoles.isExecutor || state.userRoles.isCanceler
  }, [state.userRoles, ethers.state.address])

  const canQueue = useMemo(() => {
    if (!item) return false
    return isOperator && item.status === 4
  }, [isOperator, item?.quorumReached, item?.status])

  const canExecute = useMemo(() => {
    if (!item) return false
    return item._status === 'Queued' && item.status !== 2
  }, [isOperator, item?.status, item?._status])

  const canCancel = useMemo(() => {
    if (!item) return false
    return ![0, 1, 2, 3, 7].includes(item.status)
  }, [isOperator, item?.status])

  const canPropose = useMemo(() => {
    if (!state.governorInformation) return false
    if (!state.delegation) return false
    const { proposalThreshold } = state.governorInformation
    const { votes } = state.delegation
    return votes.gte(proposalThreshold)
  }, [isProposer, state.delegation, state.governorInformation])

  const canDelegate = useMemo(() => {
    if (!state.delegation) return false
    return state.delegation.delegates.isEtherAddress()
  }, [state.delegation, ethers.state.address])

  const canVote = useMemo(() => {
    if (!state.delegation) return false
    const { power } = state.delegation
    return Boolean(power && power > 0)
  }, [state.delegation, ethers.state.address, canDelegate])

  const canReopen = useMemo(() => {
    if (!item) return
    return state.proposals[item.id].status > 6 || state.proposals[item.id].status === 3
  }, [state.proposalStateHash, item?.id])

  return useMemo(
    () =>
      ({
        isOperator,
        isProposer,
        canQueue,
        canExecute,
        canCancel,
        canPropose,
        canDelegate,
        canVote,
        canReopen
      } as OperatorStatus),
    [isOperator, isProposer, canQueue, canExecute, canCancel, canPropose, canDelegate, canVote]
  )
}
