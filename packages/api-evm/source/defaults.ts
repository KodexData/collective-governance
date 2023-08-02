import type * as T from './types'
import {
  DaoRegistry__factory,
  TimelockController__factory,
  Governance__factory,
  DaoToken__factory,
  DaoComments__factory,
  Treasury__factory,
} from '@collective-governance/hardhat'

export const defaultAbis = {
  DaoRegistry: DaoRegistry__factory.abi,
  DaoToken: DaoToken__factory.abi,
  Governance: Governance__factory.abi,
  TimelockController: TimelockController__factory.abi,
  DaoComments: DaoComments__factory.abi,
  Treasury: Treasury__factory.abi,
}

export const iFace = {
  DaoRegistry: DaoRegistry__factory.createInterface(),
  DaoToken: DaoToken__factory.createInterface(),
  Governance: Governance__factory.createInterface(),
  TimelockController: TimelockController__factory.createInterface(),
  DaoComments: DaoComments__factory.createInterface(),
  Treasury: Treasury__factory.createInterface(),
}

export const commentTopic: string = iFace.DaoComments.getEvent('Comment').format().toSha3()

export function createGovernanceEvents (governor: T.Governance): ContractEventFilters {
  return {
    created: governor.filters.ProposalCreated(),
    canceled: governor.filters.ProposalCanceled(),
    queued: governor.filters.ProposalQueued(),
    executed: governor.filters.ProposalExecuted(),
    voteCast: governor.filters.VoteCast(),
    quorumNumeratorUpdate: governor.filters.QuorumNumeratorUpdated(),
    proposalThresholdSet: governor.filters.ProposalThresholdSet(),
    votingPeriodSet: governor.filters.VotingPeriodSet(),
    votingDelaySet: governor.filters.VotingDelaySet(),
  }
}

export function iterateEventHandlers (
  filters: ContractEventFilters,
  handlers: ContractEventHandlers,
  callback: (
    eventFilter: T.TypedEventFilter<any>,
    eventHandler: T.TypedListener<any>,
    eventName: string
  ) => void
) {
  for (const listenerName in handlers) {
    const l: keyof ContractEventHandlers = listenerName as any
    const f: keyof ContractEventFilters = listenerName as any
    const eventHandler = handlers[l] as T.TypedListener<any>
    const eventFilter = filters[f] as T.TypedEventFilter<any>
    callback(eventFilter, eventHandler, listenerName)
  }
}

export type TokenInfoMethods = keyof T.DaoToken['functions']
export const tokenInfoMethods: TokenInfoMethods[] = ['name', 'symbol', 'decimals', 'totalSupply', 'allMembers', 'website', 'manifest', 'treasury', 'owner', 'commentThreshold']
export const delegationStateMethods: TokenInfoMethods[] = ['delegates', 'balanceOf', 'getVotes', 'totalSupply']

export type TimelockInfoMethods = keyof T.TimelockController['functions']
export const timelockInfoMethods: TimelockInfoMethods[] = ['getMinDelay', 'CANCELLER_ROLE', 'EXECUTOR_ROLE', 'PROPOSER_ROLE', 'TIMELOCK_ADMIN_ROLE']

export type GovernorInfoMethods = keyof T.Governance['functions']
export const governorInfoMethods: GovernorInfoMethods[] = ['votingPeriod', 'votingDelay', 'proposalThreshold', 'quorumNumerator()', 'COUNTING_MODE']

export type RefreshProposalMethods = keyof T.Governance['functions']
export const refreshProposalMethods: RefreshProposalMethods[] = ['state', 'proposalVotes', 'proposalSnapshot', 'proposalDeadline', 'proposalEta']

export type DcAbis = typeof defaultAbis

export interface ContractEventHandlers {
  created: T.TypedListener<T.ProposalCreatedEvent>
  canceled: T.TypedListener<T.ProposalCanceledEvent>
  queued: T.TypedListener<T.ProposalQueuedEvent>
  executed: T.TypedListener<T.ProposalExecutedEvent>
  voteCast: T.TypedListener<T.VoteCastEvent>
  votingDelaySet: T.TypedListener<T.VotingDelaySetEvent>
  votingPeriodSet: T.TypedListener<T.VotingPeriodSetEvent>
  proposalThresholdSet: T.TypedListener<T.ProposalThresholdSetEvent>
  quorumNumeratorUpdate: T.TypedListener<T.QuorumNumeratorUpdatedEvent>
}

export interface ContractEventFilters {
  created: ReturnType<T.Governance['filters']['ProposalCreated']>
  canceled: ReturnType<T.Governance['filters']['ProposalCanceled']>
  queued: ReturnType<T.Governance['filters']['ProposalQueued']>
  executed: ReturnType<T.Governance['filters']['ProposalExecuted']>
  voteCast: ReturnType<T.Governance['filters']['VoteCast']>
  votingDelaySet: ReturnType<T.Governance['filters']['VotingDelaySet']>
  votingPeriodSet: ReturnType<T.Governance['filters']['VotingPeriodSet']>
  proposalThresholdSet: ReturnType<T.Governance['filters']['ProposalThresholdSet']>
  quorumNumeratorUpdate: ReturnType<T.Governance['filters']['QuorumNumeratorUpdated']>
}