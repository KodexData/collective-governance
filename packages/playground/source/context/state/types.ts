import type { BigNumber } from '@ethersproject/bignumber'
import {
  Proposal,
  Proposals,
  UserRoles,
  TokenInformation,
  DelegatorVoteItem,
  TokenBalance,
  DelegationInformation,
  GovernorInformation,
  TimelockInformation,
  ContractReceipt
} from '@collective-governance/api-evm'

export interface State {
  delegateOpen?: boolean
  hideSidebar?: boolean
  searchOpen?: boolean
  isAppReady?: boolean
  loggedOut?: boolean
  lastStateUpdate?: number
  lastStateDump?: number
  proposalStateHash?: string
  chainId?: number
  isInitialized: boolean
  isLoading: boolean
  editorOpen: boolean
  proposals: Proposals
  userRoles?: UserRoles
  tokenInfo?: TokenInformation
  quorum?: string
  contracts: Partial<{
    DaoRegistry?: string
    TimelockController?: string
    Governance?: string
    Treasury?: string
    DaoToken?: string
  }>
  errors: Error[]
  receipts: ContractReceipt[]
  delegation?: DelegationInformation
  delegators?: DelegatorVoteItem[]
  treasuryBalances?: TokenBalance[]
  governorInformation?: GovernorInformation
  timelockInformation?: TimelockInformation
  abiGraphUrl?: string
  daoRegister?: GovernorInformation[]
  hideWalletInformationBox?: boolean
}

export type StateActions =
  | { type: 'reset' }
  | { type: 'logout' }
  | { type: 'save-state' }
  | { type: 'log-state' }
  | { type: 'set-all'; payload: State }
  | { type: 'set-hide-sidebar'; payload: boolean }
  | { type: 'toggle-sidebar' }
  | { type: 'set-is-loading'; payload: boolean }
  | { type: 'set-is-initialized'; payload: boolean }
  | { type: 'set-editor-open'; payload: boolean }
  | { type: 'set-chain-id'; payload: number }
  | { type: 'set-dc'; payload: string }
  | { type: 'set-timelock'; payload: string }
  | { type: 'set-governor'; payload: string }
  | { type: 'set-treasury'; payload: string }
  | { type: 'set-dao-token'; payload: string }
  | { type: 'set-proposals'; payload: Proposals }
  | { type: 'update-proposal'; payload: Proposal | Partial<Proposal> }
  | { type: 'set-user-roles'; payload: UserRoles }
  | { type: 'set-token-info'; payload: TokenInformation }
  | { type: 'add-error'; payload: Error }
  | { type: 'remove-error'; index: number }
  | { type: 'add-receipt'; payload: ContractReceipt }
  | { type: 'set-quorum'; payload: BigNumber | string }
  | { type: 'set-delegation'; payload: DelegationInformation }
  | { type: 'set-treasury-balances'; payload?: TokenBalance[] }
  | { type: 'set-dao-register'; payload: GovernorInformation[] }
  | { type: 'set-governor-information'; payload?: GovernorInformation }
  | { type: 'set-timelock-information'; payload?: TimelockInformation }
  | { type: 'set-delegators'; payload: DelegatorVoteItem[] }
  | { type: 'set-proposal-threshold'; payload: BigNumber }
  | { type: 'set-voting-delay'; payload: number }
  | { type: 'set-voting-period'; payload: number }
  | { type: 'set-numerator'; payload: number }
  | { type: 'set-abi-graph-url'; payload: string }
  | { type: 'set-is-app-ready'; payload: boolean }
  | { type: 'search/set-open'; payload: boolean }
  | { type: 'set-hide-wallet-information-box'; payload: boolean }
  | { type: 'set-delegate-open'; payload: boolean }