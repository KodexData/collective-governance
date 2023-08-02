import type { Comment } from 'types'
import type { Event } from '@ethersproject/contracts'
import { CtxEthers, CtxGovernance, CtxState } from 'context'
import { BigNumber } from '@ethersproject/bignumber'
import { useContext, useMemo } from 'react'

interface UseComments {
  getAllComments: () => Promise<Comment[]>
  canComment: boolean
  getComments: () => Comment[]
  comment: (proposalId: BigNumber | string, message: string) => Promise<Event[] | undefined>
}

/**
 * A hook to manage comments for a proposal
 * @date 26.4.2023 - 23:51:38
 *
 * @export
 * @param {?(BigNumber | string)} [id] - The ID of the proposal to manage comments for
 * @returns {UseComments} An object with functions to manage comments
 */
export default function useComments(id?: BigNumber | string): UseComments {
  const ethers = useContext(CtxEthers)
  const governance = useContext(CtxGovernance)
  const context = useContext(CtxState)

  const canComment = useMemo(() => {
    if (!ethers.state.address) return false
    if (!context.state.delegation?.votes) return false
    if (!context.state.tokenInfo?.commentThreshold) return false
    if (id && context.state.proposals[id.toString()].status === 0) return false
    const votes = context.state.delegation.votes
    return votes.gte(context.state.tokenInfo.commentThreshold)
  }, [context.state.tokenInfo?.commentThreshold, ethers.state.address, context.state.delegation])

  async function comment(proposalId: BigNumber | string, message: string) {
    if (!canComment) return
    const contract = governance.getDaoToken()!
    const { events } = await contract.comment(message, proposalId).then((tx) => tx.wait())
    return events
  }

  async function getAllComments() {
    const contract = governance.getDaoToken()!
    const filter = contract.filters.Comment()
    const eventFragment = contract.interface.getEvent('Comment')
    const comments: Comment[] = []
    for (const log of await contract.provider.getLogs(filter)) {
      const decoded = contract.interface.decodeEventLog(eventFragment, log.data, log.topics)
      const comment: Comment = {
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        member: decoded.member,
        message: decoded.message,
        proposalId: decoded.proposalId,
        timestamp: decoded.timestamp
      }

      comments.push(comment)
    }

    return comments
  }

  function getComments() {
    if (!id) return []
    return context.state.proposals[id.toString()].comments || []
  }

  return {
    getAllComments,
    canComment,
    getComments,
    comment
  }
}
