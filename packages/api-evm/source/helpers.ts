import type * as T from './types'
import BigNumberJS from 'bignumber.js'
import { id } from '@ethersproject/hash'
import { BigNumber } from '@ethersproject/bignumber'
import { Utils } from '@kodex-data/prototypes'

/**
 * Calculates the quorum weight of a proposal.
 * @date 27.4.2023 - 21:45:00
 *
 * @export
 * @param {T.Proposal} p - The proposal object to calculate the quorum weight for.
 * @returns {T.QuorumReachedState} - The quorum reached state of the proposal.
 */
export function calcQuorumWeight(p: T.Proposal): T.QuorumReachedState {
  const { forVotes, againstVotes } = p
  const quorum = new BigNumberJS(p.quorum!.toString())
  const _forVotes = Utils.sum(forVotes.map((x) => x.weight))
  const _againstVotes = Utils.sum(againstVotes.map((x) => x.weight))
  const isSucceeded = _forVotes.gt(_againstVotes) && _forVotes.gt(quorum)
  const support = Utils.sum(forVotes.map((x) => x.weight))

   // If support is less than 0, return early with a quorum reached state object with 0% and 0 factor.
  if (support.isLessThan(0))
    return <T.QuorumReachedState>{
      percent: '0',
      support: support.toFixed(),
      quorum: p.quorum!.toString(),
      factor: '0'
    }

  const _factor = support.dividedBy(quorum)
  const factor = _factor.gt(1) ? new BigNumberJS(1) : _factor
  const percent = factor.shiftedBy(2).toFixed()

  // Create a quorum reached state object with the calculated values and return it.
  const result: T.QuorumReachedState = {
    isSucceeded,
    percent: Utils.prettyNum(percent),
    support: support.toFixed(),
    quorum: p.quorum!.toString(),
    factor: factor.toFixed()
  }

  return result
}

/**
 * Merges two proposal objects together, prioritizing values from the second object.
 * @date 27.4.2023 - 22:44:23
 *
 * @export
 * @param {T.Proposal} prev - The previous proposal object to merge.
 * @param {(T.Proposal | Partial<T.Proposal>)} next - The next proposal object to merge.
 * @returns {T.Proposal} The merged proposal object.
 */
export function mergeProposal(prev: T.Proposal, next: T.Proposal | Partial<T.Proposal>): T.Proposal {
  const payload: T.Proposal = { ...prev, ...next }

  // Ensure abstainVotes, againstVotes, and forVotes are arrays
  if (!next.abstainVotes || Object.keys(next.abstainVotes).length === 0) next.abstainVotes = prev.abstainVotes || []
  if (!next.againstVotes || Object.keys(next.againstVotes).length === 0) next.againstVotes = prev.againstVotes || []
  if (!next.forVotes || Object.keys(next.forVotes).length === 0) next.forVotes = prev.forVotes || []

  // Add any new votes to the corresponding vote array
  if (next.abstainVotes && Array.isArray(next.abstainVotes)) {
    next.abstainVotes.forEach((v) => {
      if (!payload.abstainVotes.find((x) => x.txHash === v.txHash)) {
        payload.abstainVotes.push(v)
      }
    })
  }

  if (next.againstVotes && Array.isArray(next.againstVotes)) {
    next.againstVotes.forEach((v) => {
      if (!payload.againstVotes.find((x) => x.txHash === v.txHash)) {
        payload.againstVotes.push(v)
      }
    })
  }

  if (next.forVotes && Array.isArray(next.forVotes)) {
    next.forVotes.forEach((v) => {
      if (!payload.forVotes.find((x) => x.txHash === v.txHash)) {
        payload.forVotes.push(v)
      }
    })
  }

  // Update quorum and quorumReached values if provided in next object
  if (!payload.quorum && typeof next.quorum !== 'undefined') payload.quorum = next.quorum
  if (!payload.quorumReached && typeof next.quorumReached !== 'undefined') payload.quorumReached = next.quorumReached

  return payload
}

/**
 * Adds log parameters from a ProposalCreatedEvent to a proposal object.
 * @date 27.4.2023 - 22:47:33
 *
 * @export
 * @param {T.ProposalCreatedEvent} event - The ProposalCreatedEvent to extract parameters from.
 * @param {Partial<T.Proposal>} data - The proposal object to merge the parameters into.
 * @returns {T.Proposal} - The modified proposal object with the added log parameters.
 */
export function addLogParamsToProposal(event: T.ProposalCreatedEvent, data: Partial<T.Proposal>): T.Proposal {
  const { transactionHash, blockHash, blockNumber } = event
  const { proposalId, proposer, startBlock, endBlock, description, calldatas, signatures, targets } = event.args
  const descriptionHash = id(description)
  const headline = getHeadline(description)

  return {
    ...data,
    transactionHash,
    blockHash,
    blockNumber,
    descriptionHash,
    headline,
    proposalId,
    values: event.args[3],
    startBlock: startBlock.toNumber(),
    endBlock: endBlock.toNumber(),
    targets,
    signatures,
    calldatas,
    proposer,
    description
  } as T.Proposal
}

/**
 * format Proposal Status enum to string
 * @date 1/8/2023 - 9:20:37 PM
 *
 * @export
 * @param {T.ProposalStatus} state
 * @returns {(keyof typeof T.ProposalStatus)}
 */
export function parseProposalState(state: T.ProposalStatus): keyof typeof T.ProposalStatus {
  switch (state) {
    case 0:
      return 'Pending' as keyof typeof T.ProposalStatus
    case 1:
      return 'Active' as keyof typeof T.ProposalStatus
    case 2:
      return 'Canceled' as keyof typeof T.ProposalStatus
    case 3:
      return 'Defeated' as keyof typeof T.ProposalStatus
    case 4:
      return 'Succeeded' as keyof typeof T.ProposalStatus
    case 5:
      return 'Queued' as keyof typeof T.ProposalStatus
    case 6:
      return 'Expired' as keyof typeof T.ProposalStatus
    case 7:
      return 'Executed' as keyof typeof T.ProposalStatus
    default:
      throw new Error(`ProposalStatus: should never happen`)
  }
}

/**
 * parse `VoteSupport` enum to string
 * @date 1/15/2023 - 4:58:26 AM
 *
 * @export
 * @param {T.VoteSupport} support
 * @returns {keyof typeof T.VoteSupport}
 */
export function parseSupport(support: T.VoteSupport): keyof typeof T.VoteSupport {
  switch (support) {
    case 0:
      return 'Against' as keyof typeof T.VoteSupport
    case 1:
      return 'For' as keyof typeof T.VoteSupport
    case 2:
      return 'Abstain' as keyof typeof T.VoteSupport
    case 3:
      return 'Comment' as keyof typeof T.VoteSupport
    default:
      throw new Error(`VoteSupport: should never happen`)
  }
}

/**
 * Calculates the quorum state based on the given quorum, pro, and con values.
 * @date 1/15/2023 - 4:57:42 AM
 * @dev using bignumber.js for decimal calculations
 *
 * @param {BigNumber} quorum - The quorum value to use.
 * @param {BigNumber} pro - The pro value to use.
 * @param {BigNumber} con - The con value to use.
 * @returns {number} - The calculated quorum state as a percentage value.
 */
export function calcQuorumState(quorum: BigNumber, pro: BigNumber): number {
  const percentage = pro.toBN().dividedBy(quorum.toBN('bignumber.js')).shiftedBy(2).toNumber()
  if (percentage < 0) return 0
  return percentage
}

/**
 * parses headline from description and will remove markdown headline tag
 * @date 1/15/2023 - 4:57:13 AM
 *
 * @param {string} description
 * @returns {string}
 */
export function getHeadline(description: string): string {
  description = description.split('\n')[0]
  if (description.startsWith(`# `)) description = description.replace('# ', '')
  return description.toUpperCase()
}

/**
 * calculates percentage decimal by given quorum on total supply
 * @date 1/15/2023 - 4:56:28 AM
 *
 * @export
 * @param {BigNumber} _quorum
 * @param {BigNumber} _totalSupply
 * @returns {string}
 */
export function calculateQuorumFraction(_quorum: BigNumber, _totalSupply: BigNumber): string {
  const quorum = _quorum.toBN('bignumber.js')
  const totalSupply = _totalSupply.toBN()
  return quorum.dividedBy(totalSupply).shiftedBy(2).toFixed()
}

/**
 * calculates voting power (supply weight)
 * @date 1/15/2023 - 4:55:47 AM
 *
 * @export
 * @param {BigNumber} balance
 * @param {BigNumber} totalSupply
 * @returns {number}
 */
export function calculateVotingPower(balance: BigNumber, totalSupply: BigNumber): number {
  const raw = balance.toString().toBN().dividedBy(totalSupply.toString().toBN()).shiftedBy(2)
  return Number(Number(raw).toFixed(2))
}

/**
 * checks if given bytecode matches Governance signatures
 * @date 11/8/2022 - 10:30:31 AM
 * @export
 * @param {string} bytecode
 * @returns {boolean}
 */
export function isGovernor(bytecode: string): boolean {
  let found = 0

  const required = [
    'c59057e4', // c59057e4  =>  hashProposal(address[],uint256[],bytes[],bytes32)
    '2656227d', // 2656227d  =>  execute(address[],uint256[],bytes[],bytes32)
    '160cbed7', // 160cbed7  =>  queue(address[],uint256[],bytes[],bytes32)'
    'd33219b4', // d33219b4  =>  timelock()
    'eb9019d4', // eb9019d4  =>  getVotes(address,uint256)
    '06fdde03' // 06fdde03  =>  name()
  ].map((signature) => {
    if (bytecode.includes(signature)) found++
    return signature
  })

  return found === required.length
}

/**
 * checks if given bytecode matches TimelockController signatures
 * @date 1/9/2023 - 5:13:22 PM
 *
 * @export
 * @param {string} bytecode
 * @returns {boolean}
 */
export function isTimelock(bytecode: string): boolean {
  let found = 0

  const required = [
    'b1c5f427', // b1c5f427  =>  hashOperationBatch(address[],uint256[],bytes[],bytes32,bytes32)
    'f27a0c92', // f27a0c92  =>  getMinDelay()
    '2ab0f529', // 2ab0f529  =>  isOperationDone(bytes32)
    'e38335e5' // e38335e5  =>  executeBatch(address[],uint256[],bytes[],bytes32,bytes32)
  ].map((signature) => {
    if (bytecode.includes(signature)) found++
    return signature
  })

  return found === required.length
}

export function isERC20(bytecode: string) {
  const sigs = [
    '06fdde03',
    '95d89b41',
    '313ce567',
    '18160ddd',
    '70a08231',
    'dd62ed3e',
    'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  ]

  return (
    sigs.length ===
    sigs.reduce((a, signature) => {
      if (bytecode.includes(signature)) a++
      return a
    }, 0)
  )
}

/**
 * verifies bytecode
 * @date 11/9/2022 - 5:37:20 PM
 *
 * ```
 * Sighash   |   Function Signature
 * ========================
 * 21d0df29  =>  activateDAO(address,string)
 * 69e01e75  =>  deactivateDAO(address,string)
 * 1b410312  =>  isActiveDAO(address)
 * bb3fb995  =>  totalDAOs()
 * c51097a7  =>  allDAOs()
 * ```
 * @export
 * @param {string} bytecode
 * @returns {boolean}
 */
export function isDaoRegistry(bytecode: string): boolean {
  return (
    bytecode.includes(`21d0df29`) &&
    bytecode.includes(`69e01e75`) &&
    bytecode.includes(`1b410312`) &&
    bytecode.includes(`bb3fb995`) &&
    bytecode.includes(`c51097a7`)
  )
}

type PromiseOrValue<Type = void> = Type | Promise<Type>
type CheckBytecodeCallback<Type = boolean> = (bytecode: string) => PromiseOrValue<Type>
type CheckBytecodeOptions = Partial<{
  address: string
  bytecode: string
  provider: T.Provider
}>

export async function checkBytecode(callback: CheckBytecodeCallback, options: CheckBytecodeOptions = {}) {
  if (!options.provider) throw new Error(`provider is required`)
  if (!options.address && !options.bytecode) throw new Error(`neither address or bytecode provided`)
  if (!options.bytecode && options.address) options.bytecode = await options.provider.getCode(options.address)
  return await callback(options.bytecode || '0x')
}
