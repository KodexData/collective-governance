import type { CommentEvent } from '@collective-governance/hardhat/types/DaoComments'
import type { BigNumber } from '@ethersproject/bignumber'
import type {
  ProposalCanceledEvent,
  ProposalCreatedEvent,
  ProposalExecutedEvent,
  ProposalQueuedEvent,
  VoteCastEvent,
  VoteCastWithParamsEvent
} from '@collective-governance/hardhat/types/Governance'

export type {
  DaoToken,
  Governance,
  Treasury,
  DaoWrapped,
  DaoRegistry,
  TimelockController,
  DaoComments
} from '@collective-governance/hardhat'

export type { DepositedEvent, WithdrawnEvent } from '@collective-governance/hardhat/types/Treasury'
export type { CommentEvent, CommentEventFilter } from '@collective-governance/hardhat/types/DaoComments'
export type {
  ActivatedDAOEvent,
  DeactivatedDAOEvent,
  OwnershipTransferredEvent
} from '@collective-governance/hardhat/types/DaoRegistry'

export type {
  ProposalCanceledEvent,
  ProposalCreatedEvent,
  ProposalQueuedEvent,
  ProposalExecutedEvent,
  VoteCastWithParamsEvent,
  VoteCastEvent,
  ProposalThresholdSetEvent,
  VotingPeriodSetEvent,
  VotingDelaySetEvent,
  QuorumNumeratorUpdatedEvent
} from '@collective-governance/hardhat/types/Governance'

export type { DelegateChangedEvent } from '@collective-governance/hardhat/types/DaoToken'

export type { TypedListener, TypedEventFilter } from '@collective-governance/hardhat/types/common'

export type { Operation, FnParameters, NonNullable } from '@kodex-data/multicall'
export type { PermitConfig } from '@kodex-data/permit'

export type { Contract } from '@ethersproject/contracts'
export type { Signature } from '@ethersproject/bytes'
export type { ContractReceipt } from '@ethersproject/contracts'
export type { Signer } from '@ethersproject/abstract-signer'
export type { Provider, Web3Provider, Block } from '@ethersproject/providers'
export type { FunctionFragment, JsonFragment, Result } from '@ethersproject/abi'
export type { TransactionResponse } from '@ethersproject/providers'

export type ParsedLog = {
  transactionHash: string
  logIndex: number
  blockNumber: number
  address: string
  topics: string[]
  data: string
  signature: string
  params: Record<string, any>
}

export type ParsedMethod = {
  transactionHash: string
  sigHash: string
  signature: string
  params: Record<string, any>
}

export type DelegationInformation = {
  address: string
  delegates: string
  balance: BigNumber
  votes: BigNumber
  power?: number
  totalSupply?: BigNumber
}

export type GovernorInformation = {
  votingPeriod: number
  votingDelay: number
  proposalThreshold: BigNumber
  quorum: BigNumber
  numerator: number
  mode: string
}


export type QuorumReachedState = Partial<{
  isSucceeded?: boolean
  percent: string
  support: string
  quorum: string
  factor: string
}>

export enum VoteSupport {
  Against,
  For,
  Abstain,
  Comment,
}

export enum ProposalStatus {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed
}

export type DelegatorVoteItem = {
  delegator: string
  votes: BigNumber
}

export type VoteDetail = {
  voter: string
  support: number
  weight: string
  reason?: string
  txHash: string
  block: number
}

export type TokenBalance = {
  symbol: string
  decimals: number
  balance: BigNumber
  parsed: string
  token: string
}

export type ProposalBlockRelated = {
  startBlock: number
  proposalId: BigNumber
  quorum?: BigNumber
  pastTotalSupply?: BigNumber
}

export enum AddressType {
  CONTRACT,
  ADDRESS
}

export interface AddressInformation {
  current?: boolean
  type: keyof typeof AddressType
  hash: string
  description: string
  chainId?: number
}

export interface Comment {
  member: string
  proposalId: BigNumber
  blockNumber: number
  timestamp: BigNumber
  message: string
  transactionHash: string
}

export interface Proposal {
  id: string
  isActive: boolean
  transactionHash: string
  blockHash: string
  blockNumber: number
  descriptionHash: string
  status: ProposalStatus
  _status: keyof typeof ProposalStatus
  headline: string
  _forVotes: BigNumber
  _againstVotes: BigNumber
  _abstainVotes: BigNumber
  forVotes: VoteDetail[]
  againstVotes: VoteDetail[]
  abstainVotes: VoteDetail[]
  proposalId: BigNumber
  proposer: string
  endBlock: number
  startBlock: number
  description: string
  targets: string[]
  calldatas: string[]
  signatures: string[]
  values: any[]
  percentage: number
  quorum?: BigNumber
  snapshot: number
  deadline: number
  eta: number
  quorumReached: boolean
  pastTotalSupply: BigNumber
  comments: Comment[]
}

export type Proposals = {
  [proposalId: string]: Proposal
}

export type OperationParameters = [string[], any[], string[], string]

export type TimelockInformation = {
  address: string
  minDelay: BigNumber
  roles: {
    CANCELLER_ROLE: string
    EXECUTOR_ROLE: string
    PROPOSER_ROLE: string
    TIMELOCK_ADMIN_ROLE: string
  }
}

export type TokenInformation = {
  name: string
  symbol: string
  decimals: number
  totalSupply: BigNumber
  members: string[]
  website: string
  manifest: string
  treasury: string
  address: string
  owner: string
  commentThreshold?: BigNumber
}

export type AllGovernanceLogs = {
  created: ProposalCreatedEvent[]
  executed: ProposalExecutedEvent[]
  queued: ProposalQueuedEvent[]
  cancelled: ProposalCanceledEvent[]
  voteCast: VoteCastEvent[]
  voteCastWithParams: VoteCastWithParamsEvent[]
  comments?: CommentEvent[]
}

export type UserRoles = {
  user: string
  isAdmin: boolean
  isExecutor: boolean
  isProposer: boolean
  isCanceler: boolean
}
