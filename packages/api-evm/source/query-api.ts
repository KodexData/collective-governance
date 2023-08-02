import type { Network } from '@ethersproject/networks'
import type { Event } from '@ethersproject/contracts'
import type * as T from './types'
import * as H from './helpers'
import { uniq } from 'lodash'
import { MultiCallApi } from './resolvers'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import {
  TimelockController__factory,
  Governance__factory,
  DaoToken__factory,
  Treasury__factory,
  ERC20__factory
} from '@collective-governance/hardhat'

export type ApiStats = {
  voters: Record<string, number>
  proposalIds: string[]
  totalProposals: number
  uniqueVoters: string[]
  totalVotes: number
  totalProposers: string[]
  proposers: Record<string, string[]>
}

interface GovernanceLogs {
  created: Map<string, T.ProposalCreatedEvent>
  executed: Map<string, T.ProposalExecutedEvent>
  queued: Map<string, T.ProposalQueuedEvent>
  cancelled: Map<string, T.ProposalCanceledEvent>
  voteCast: Map<string, T.VoteCastEvent>
  voteCastWithParams: Map<string, T.VoteCastWithParamsEvent>
  deposits: Map<string, T.DepositedEvent>
  comments: Map<string, T.CommentEvent>
}

interface GovernanceStats {
  proposals: number
  totalVotes: number
  totalFor: number
  totalAgainst: number
  totalAbstain: number
  totalSucceeded: number
  totalDefeated: number
  totalActive: number
  totalPending: number
}

interface ApiOptionsBase {
  extendMulticall?: { chainId: number, address: string }[]
  provider: T.Provider
  debug?: boolean
}

interface ApiOptionsWithInstances extends ApiOptionsBase {
  governor: T.Governance
  token: T.DaoToken
  timelock: T.TimelockController
  treasury: T.Treasury
}

interface ApiOptionsWithAddresses extends ApiOptionsBase {
  governor: string
  token?: string
  timelock?: string
  treasury?: string
}

type ContractAddresses = {
  governor: string
  token: string
  timelock: string
  treasury: string
}

interface QueryOverrides<C extends Contract> {
  contract?: C
  source?: string
  address?: string
}

type ApiOptions = ApiOptionsWithInstances | ApiOptionsWithAddresses

interface TknQueryResult {
  token: string
  holder: string
  value: BigNumber
}

interface DelegationState {
  address: string
  balance: BigNumber
  delegates: string
  votes: BigNumber
  power: number
}

interface QueryLogsResult {
  created: T.ProposalCreatedEvent[]
  voteCast: T.VoteCastEvent[]
  comment: T.CommentEvent[]
}

interface QueryAllLogsResult {
  created: T.ProposalCreatedEvent[]
  executed: T.ProposalExecutedEvent[]
  queued: T.ProposalQueuedEvent[]
  cancelled: T.ProposalCanceledEvent[]
  voteCast: T.VoteCastEvent[]
  voteCastWithParams: T.VoteCastWithParamsEvent[]
}

function isOptionsWithAddresses(obj: any): obj is ApiOptionsWithInstances {
  if (!obj || obj['governor']) return false
  return typeof obj['governor'] === 'string'
}

export default class QueryApi {
  maxLogBlocks = 100000
  debug = false
  proposals = new Map<string, T.Proposal>()

  eventLogs: GovernanceLogs = {
    cancelled: new Map(),
    created: new Map(),
    executed: new Map(),
    queued: new Map(),
    voteCast: new Map(),
    voteCastWithParams: new Map(),
    deposits: new Map(),
    comments: new Map()
  }
  
  /**
   * Governance stats object.
   * @date 28.4.2023 - 00:56:09
   *
   * @readonly
   * @type {GovernanceStats}
   */
  get stats(): GovernanceStats {
    const votes = Array.from(this.eventLogs.voteCast.values())
    const proposals = Array.from(this.proposals.values())
    return {
      proposals: this.proposals.size,
      totalAbstain: votes.filter((result) => result.args.support === 2).length,
      totalAgainst: votes.filter((result) => result.args.support === 0).length,
      totalFor: votes.filter((result) => result.args.support === 1).length,
      totalActive: proposals.filter((result) => result._status === 'Active').length,
      totalDefeated: proposals.filter((result) => result._status === 'Defeated').length,
      totalPending: proposals.filter((result) => result._status === 'Pending').length,
      totalSucceeded: proposals.filter((result) => result._status === 'Succeeded').length,
      totalVotes: votes.length
    }
  }

  /**
   * Resets the query API's state.
   * @date 28.4.2023 - 00:55:49
   */
  reset() {
    this.eventLogs = {
      cancelled: new Map(),
      created: new Map(),
      deposits: new Map(),
      executed: new Map(),
      queued: new Map(),
      voteCast: new Map(),
      voteCastWithParams: new Map(),
      comments: new Map()
    }

    this.getEventStats()
  }

  isInitialized = false
  _network?: Network
  _provider!: T.Provider
  _governor!: T.Governance
  _token!: T.DaoToken
  _timelock!: T.TimelockController
  _treasury!: T.Treasury

  get contractAddresses(): ContractAddresses {
    return {
      governor: this._governor?.address,
      token: this._token?.address,
      timelock: this._timelock?.address,
      treasury: this._treasury?.address
    }
  }
  
  /**
   * Creates an instance of QueryApi.
   * @date 28.4.2023 - 00:56:31
   *
   * @constructor
   * @param {?ApiOptions} [options]
   */
  constructor(options?: ApiOptions) {
    if (typeof options !== 'undefined') {
      for (const { chainId, address } of options.extendMulticall || []) {
        MultiCallApi.Contracts.set(chainId, address)
      }

      this.initialize(options)
    }
  }

  /**
   * override signer to contract instances
   * @date 28.4.2023 - 00:57:04
   *
   * @param {(T.Provider | T.Signer)} providerOrSigner
   */
  connect(providerOrSigner: T.Provider | T.Signer) {
    this._governor = this._governor.connect(providerOrSigner)
    this._treasury = this._treasury.connect(providerOrSigner)
    this._timelock = this._timelock.connect(providerOrSigner)
    this._token = this._token.connect(providerOrSigner)
  }

  /**
   * Initializes the query API.
   * @date 28.4.2023 - 00:57:36
   *
   * @async
   * @param {ApiOptions} options - Options object.
   * @returns {Promise<ContractAddresses>} - A promise that resolves to the contract addresses object.
   */
  async initialize(options: ApiOptions): Promise<ContractAddresses> {
    if (typeof options.debug === 'boolean') this.debug = options.debug
    this.proposals.clear()
    this._provider = options.provider
    this._network = await this._provider.getNetwork()

    if (isOptionsWithAddresses(options)) {
      this._governor = options.governor
      this._token = options.token
      this._timelock = options.timelock
      this._treasury = options.treasury
      this.isInitialized = true
      return this.contractAddresses
    }

    this._governor = Governance__factory.connect(options.governor, this._provider)

    if (typeof options.token === 'undefined') options.token = await this._governor.token()
    this._token = DaoToken__factory.connect(options.token, this._provider)

    if (typeof options.timelock === 'undefined') options.timelock = await this._governor.timelock()
    this._timelock = TimelockController__factory.connect(options.timelock, this._provider)

    if (typeof options.treasury === 'undefined') options.treasury = await this._token.treasury()
    this._treasury = Treasury__factory.connect(options.treasury, this._provider)

    this.isInitialized = true
    return this.contractAddresses
  }

  /**
   * Fetches token information.
   * @date 28.4.2023 - 00:58:29
   *
   * @async
   * @param {QueryOverrides<T.DaoToken>} [overrides={ contract: this._token }] - Query overrides object.
   * @returns {Promise<T.TokenInformation>} - A promise that resolves to the token information object.
   */
  async getTokenInfo(overrides: QueryOverrides<T.DaoToken> = { contract: this._token }): Promise<T.TokenInformation> {
    const contract = this.#checkContract(overrides.contract, {
      position: 'getTokenInfo',
      address: overrides.address || overrides.contract?.address || this._token.address
    })
    try {
      return await new MultiCallApi().getTokenInfos(contract)
    } catch (error) {
      console.error(`error multicall get token infos`, error)
      const name = await contract.name()
      const symbol = await contract.symbol()
      const decimals = await contract.decimals()
      const totalSupply = await contract.totalSupply()
      const members = await contract.allMembers()
      const website = await contract.website()
      const manifest = await contract.manifest()
      const treasury = await contract.treasury()
      const owner = await contract.owner()
      const address = contract.address

      let commentThreshold: BigNumber | undefined
      try {
        commentThreshold = await contract.commentThreshold()
      } catch (error) {}

      return { name, symbol, decimals, totalSupply, members, manifest, website, treasury, address, owner, commentThreshold }
    }
  }

  /**
   * Fetches timelock information.
   * @date 28.4.2023 - 00:59:38
   *
   * @async
   * @param {QueryOverrides<T.TimelockController>} [overrides={ contract: this._timelock }] - Query overrides object.
   * @returns {Promise<T.TimelockInformation>} - A promise that resolves to the timelock information object.
   */
  async getTimelockInfo(overrides: QueryOverrides<T.TimelockController> = { contract: this._timelock }): Promise<T.TimelockInformation> {
    const contract = this.#checkContract(overrides.contract, {
      position: 'getTimelockInfo',
      address: overrides.address || overrides.contract?.address || this._timelock.address
    })
    try {
      return await new MultiCallApi().getTimelockInfo(contract)
    } catch (error) {
      const address = this._timelock.address
      const roles = {
        CANCELLER_ROLE: await contract.CANCELLER_ROLE(),
        EXECUTOR_ROLE: await contract.EXECUTOR_ROLE(),
        PROPOSER_ROLE: await contract.PROPOSER_ROLE(),
        TIMELOCK_ADMIN_ROLE: await contract.TIMELOCK_ADMIN_ROLE()
      }

      const minDelay = await this._timelock.getMinDelay()
      return { address, minDelay, roles }
    }
  }
  
  /**
   * Fetches the user's roles in the DAO.
   * @date 28.4.2023 - 01:01:41
   *
   * @async
   * @param {string} user - The user's address.
   * @param {QueryOverrides<T.TimelockController>} [overrides={ contract: this._timelock }] - Query overrides object.
   * @returns {Promise<T.UserRoles & { timelockInfo: T.TimelockInformation; }>} - A promise that resolves to the user roles object.
   */
  async getUserRoles(user: string, overrides: QueryOverrides<T.TimelockController> = { contract: this._timelock }): Promise<T.UserRoles & { timelockInfo: T.TimelockInformation; }> {
    const contract = this.#checkContract(overrides.contract, {
      position: 'getUserRoles',
      address: overrides.address || overrides.contract?.address || this._timelock.address
    })
    try {
      return new MultiCallApi().getUserRoles(contract, user)
    } catch (error) {
      console.error(`error multicall getUserRoles`, error)
      const timelockInfo = await this.getTimelockInfo({ contract })
      const { TIMELOCK_ADMIN_ROLE, PROPOSER_ROLE, EXECUTOR_ROLE, CANCELLER_ROLE } = timelockInfo.roles
      const isAdmin = await contract.hasRole(TIMELOCK_ADMIN_ROLE, user)
      const isExecutor = await contract.hasRole(PROPOSER_ROLE, user)
      const isProposer = await contract.hasRole(EXECUTOR_ROLE, user)
      const isCanceler = await contract.hasRole(CANCELLER_ROLE, user)
      return { user, isAdmin, isExecutor, isProposer, isCanceler, timelockInfo }
    }
  }
  
  /**
   * Fetches token balances for a given token and members.
   * @date 28.4.2023 - 01:03:17
   * @dev requires multicall
   *
   * @async
   * @param {string} token - The token's address.
   * @param {string[]} members - The members' addresses.
   * @param {QueryOverrides<T.DaoToken>} [overrides={ contract: this._token }] - Query overrides object.
   * @returns {Promise<TknQueryResult[] | undefined>} - A promise that resolves to the token balance array.
   */
  async getTokenBalances(token: string, members: string[], overrides: QueryOverrides<T.DaoToken> = { contract: this._token }): Promise<TknQueryResult[] | undefined> {
    if (members.length > 0)
      try {
        const query = new MultiCallApi()
        members.map((holder) => query.balanceOf.add(token, holder))
        return await query.balanceOf.query(overrides.contract!.provider)
      } catch (error) {}
  }

  /**
   * Fetches treasury balances.
   * @date 28.4.2023 - 01:07:15
   *
   * @async
   * @param {QueryOverrides<T.Treasury>} [overrides={ contract: this._treasury }] - Query overrides object.
   * @returns {Promise<T.TokenBalance[]>} - A promise that resolves to the treasury balance array.
   */
  async getTreasuryBalances(overrides: QueryOverrides<T.Treasury> = { contract: this._treasury }): Promise<T.TokenBalance[]> {
    const contract = this.#checkContract(overrides.contract, {
      position: 'getTreasuryBalances',
      address: overrides.address || overrides.contract?.address || this._treasury.address
    })

    const query = new MultiCallApi()
    const deposits = <T.DepositedEvent[]>await this.iterateLogs(contract, contract.filters.Deposited(), 0)
    deposits.map((deposit) => this.eventLogs.deposits.set(deposit.transactionHash, deposit))
    const data = {
      tokens: <string[]>[],
      balances: <T.TokenBalance[]>[]
    }

    // prettier-ignore
    for (const { args: { token } } of deposits) {
      if (token.isEtherAddress()) continue
      if (data.tokens.includes(token.toChecksumAddress())) continue
      const code = await contract.provider.getCode(token)
      if (code === '0x') continue

      data.tokens.push(token.toChecksumAddress())
      query.balanceOf.add(token, contract.address)
    }

    if (data.tokens.length > 0) {
      const balances = await query.balanceOf.query(contract.provider)

      for (const { token, value } of balances) {
        const tkn = ERC20__factory.connect(token, contract.provider)
        const symbol = await tkn.symbol()
        const decimals = await tkn.decimals()
        const parsed = value.toString().shiftedBy(-decimals)
        const result = { symbol, decimals, balance: value, parsed, token }
        data.balances.push(result)
      }
    }

    const etherBalance = await contract.provider.getBalance(contract.address)
    data.balances.push({
      balance: etherBalance,
      decimals: 18,
      symbol: 'ETHER',
      parsed: etherBalance.toString().shiftedBy(-18),
      token: '0x0000000000000000000000000000000000000000'
    })

    return data.balances
  }

  /**
   * Builds a proposal board.
   * @date 28.4.2023 - 01:08:05
   *
   * @async
   * @param {?(string | number)} [fromBlock] - The block from which to start building the proposal board.
   * @param {QueryOverrides<T.Governance>} [overrides={ contract: this._governor }] - Query overrides object.
   * @returns {Promise<T.Proposals>} - A promise that resolves to the proposals object.
   */
  async buildProposalBoard(fromBlock?: string | number, overrides: QueryOverrides<T.Governance> = { contract: this._governor }): Promise<T.Proposals> {
    if (overrides.source) console.debug(`api.buildProposalBoard triggered by: ${overrides.source}`)
    const contract = this.#checkContract(overrides.contract, {
      position: 'buildProposalBoard',
      address: overrides.address || overrides.contract?.address || this._governor.address
    })
    const allLogs = await this.queryLogs(fromBlock, contract)
    const currentBlock = await this._provider.getBlockNumber()
    const pendingProps = allLogs.created.filter((x) => x.args.startBlock.gte(currentBlock))
    allLogs.created = allLogs.created.filter((x) => !x.args.startBlock.gte(currentBlock))

    if (allLogs.created.length <= 0 && allLogs.created.length <= 0 && fromBlock) {
      throw new Error(`NO_NEW_LOGS_${fromBlock}`)
    }

    if (allLogs.created.length <= 0 && !fromBlock) {
      throw new Error(`GOVERNANCE_PROPOSALS_EMPTY`)
    }

    try {
      let activeProposals = await new MultiCallApi().buildProposalBoard(contract, this._token, allLogs, currentBlock)
      for (const event of pendingProps)
        try {
          const data = await new MultiCallApi().refetchProposal(contract, event.args.proposalId)
          activeProposals = { ...activeProposals, [event.args.proposalId.toString()]: H.addLogParamsToProposal(event, data) }
        } catch (error) {
          console.error(`error fetching pending proposal: ${event.args.proposalId}`, error)
        }

      activeProposals = this.#mixInComments(activeProposals, allLogs.comment)
      for (const proposal of Object.values(activeProposals)) {
        this.proposals.set(proposal.id, proposal)
      }

      return activeProposals
    } catch (error) {
      console.warn(`building proposal in single query mode`)
      console.error(`multi-call error buildProposalBoard`, error)

      const proposals: T.Proposals = {}
      for (const event of allLogs.created) {
        const { proposalId } = event.args
        const state = await this.fetchProposalById(proposalId, BigNumber.from(currentBlock), { contract })
        proposals[proposalId.toString()] = H.addLogParamsToProposal(event, state)
      }

      for (const event of allLogs.voteCast) {
        const { proposalId, voter, weight, support, reason } = event.args
        if (!proposals[proposalId.toString()]) continue // should never happen

        //prettier-ignore
        const voteData: T.VoteDetail = {
          voter, support, reason,
          weight: weight.toString(),
          block: event.blockNumber,
          txHash: event.transactionHash
        }

        if (support === 1) proposals[proposalId.toString()].forVotes.push(voteData)
        if (support === 0) proposals[proposalId.toString()].againstVotes.push(voteData)
        if (support === 2) proposals[proposalId.toString()].abstainVotes.push(voteData)
      }

      for (const proposal of Object.values(proposals)) {
        this.proposals.set(proposal.id, proposal)
      }

      return proposals
    }
  }

  /**
   * Fetches a proposal by ID.
   * @date 28.4.2023 - 01:09:25
   *
   * @async
   * @param {BigNumber} proposalId - The proposal ID.
   * @param {BigNumber} startBlock - The block from which to start searching for the proposal.
   * @param {QueryOverrides<T.Governance>} [overrides={ contract: this._governor }] - Query overrides object.
   * @returns {Promise<Partial<T.Proposal>>} - A promise that resolves to the partial proposal object.
   */
  async fetchProposalById(
    proposalId: BigNumber,
    startBlock: BigNumber,
    overrides: QueryOverrides<T.Governance> = { contract: this._governor }
  ): Promise<Partial<T.Proposal>> {
    const contract = this.#checkContract(overrides.contract || this._governor, {
      position: 'fetchProposalById',
      address: overrides.address || overrides.contract?.address || this._governor.address
    })
    const { againstVotes, forVotes, abstainVotes } = await contract.proposalVotes(proposalId)
    const snapshot = await contract.proposalSnapshot(proposalId)
    const deadline = await contract.proposalDeadline(proposalId)
    const status = await contract.state(proposalId)
    const quorum = await contract.quorum(startBlock)
    const eta = await contract.proposalEta(proposalId)
    const quorumReached = forVotes.gt(quorum)
    const _percentage = forVotes.gt(0) ? H.calcQuorumState(quorum, forVotes) : 0
    const percentage = Number(_percentage.toFixed(2))
    const pastTotalSupply = await this._token.getPastTotalSupply(startBlock)

    const proposal: Partial<T.Proposal> = {
      id: proposalId.toString(),
      isActive: true,
      status,
      _status: H.parseProposalState(status),
      snapshot: snapshot.toNumber(),
      quorum,
      quorumReached,
      percentage,
      deadline: deadline.toNumber(),
      eta: eta.toNumber(),
      abstainVotes: [],
      againstVotes: [],
      forVotes: [],
      _abstainVotes: abstainVotes,
      _againstVotes: againstVotes,
      _forVotes: forVotes,
      pastTotalSupply
    }

    return proposal
  }

  /**
   * Update a proposal's data with the latest state from the blockchain.
   * @date 28.4.2023 - 01:12:04
   *
   * @async
   * @param {T.Proposal} previous - The previous state of the proposal.
   * @param {QueryOverrides<T.Governance>} [overrides={ contract: this._governor }] - Query overrides object.
   * @returns {Promise<T.Proposal>} - The updated proposal.
   */
  async updateProposal(previous: T.Proposal, overrides: QueryOverrides<T.Governance> = { contract: this._governor }): Promise<T.Proposal> {
    const body = await new MultiCallApi().refetchProposal(overrides.contract!, previous.id)
    const proposal = H.mergeProposal(previous, body)
    this.proposals.set(proposal.id, proposal)
    return proposal
  }

  /**
   * Get the delegation state of a given delegator address.
   * @date 28.4.2023 - 01:12:58
   *
   * @async
   * @param {string} delegatorAddress - The address of the delegator.
   * @param {?(BigNumber | number | string)} [totalSupplyOrPower] - The total supply or power of the DAO. If not provided, the value will be fetched from the contract.
   * @param {QueryOverrides<T.DaoToken>} [overrides={ contract: this._token }] - Query overrides object.
   * @returns {Promise<DelegationState>} - The delegation state of the given delegator.
   */
  async getDelegationState(
    delegatorAddress: string,
    totalSupplyOrPower?: BigNumber | number | string,
    overrides: QueryOverrides<T.DaoToken> = { contract: this._token }
  ): Promise<DelegationState> {
    const contract = this.#checkContract(overrides.contract || this._token)
    async function generatePower(balance: BigNumber) {
      let power: number
      if (typeof totalSupplyOrPower === 'undefined') {
        const totalSupply = await contract.totalSupply()
        power = H.calculateVotingPower(balance, totalSupply)
      } else if (typeof totalSupplyOrPower === 'number') {
        power = totalSupplyOrPower
      } else if (totalSupplyOrPower instanceof BigNumber) {
        power = H.calculateVotingPower(balance, totalSupplyOrPower)
      } else if (typeof totalSupplyOrPower === 'string') {
        power = H.calculateVotingPower(balance, BigNumber.from(totalSupplyOrPower))
      } else {
        throw new Error(`DelegationState: should never happen - ${typeof totalSupplyOrPower}: ${totalSupplyOrPower}`)
      }
      return power
    }

    try {
      const caller = new MultiCallApi()
      const delegation = await caller.getDelegationState(contract, delegatorAddress)
      if (!totalSupplyOrPower) delegation.totalSupply = delegation.totalSupply
      const power = await generatePower(delegation.balance!)
      return { ...delegation, power }
    } catch (error) {
      console.error(`error multicall getDelegationState`, error)

      //prettier-ignore
      return contract.delegates(delegatorAddress).then(async (delegates) => {
        const balance = await contract.balanceOf(delegatorAddress)
        const votes = await contract.getVotes(delegatorAddress)
        const power = await generatePower(balance)
        return { address: delegatorAddress, balance, delegates, votes, power }
      })
    }
  }

  /**
   * Retrieves a list of all delegators, along with their current voting power and delegate.
   * @date 28.4.2023 - 01:15:47
   *
   * @async
   * @param {QueryOverrides<T.DaoToken>} [overrides={ contract: this._token }] - Query overrides object.
   * @returns {Promise<T.DelegatorVoteItem[]>} - A list of all delegators, along with their current voting power and delegate.
   */
  async getAllDelegators(overrides: QueryOverrides<T.DaoToken> = { contract: this._token }): Promise<T.DelegatorVoteItem[]> {
    const contract = this.#checkContract(overrides.contract, {
      position: 'getAllDelegators',
      address: overrides.address || overrides.contract?.address || this._token.address
    })

    const events = <T.DelegateChangedEvent[]>await this.iterateLogs(contract, contract.filters.DelegateChanged())

    const allDelegators = uniq(
      events
        .map((e) => e.args.delegator)
        .concat(events.map((e) => e.args.fromDelegate))
        .concat(events.map((e) => e.args.toDelegate))
    ).filter((e) => !e.isEtherAddress())

    if (allDelegators.length === 0) return []

    return await new MultiCallApi().getDelegatorVotes(contract, allDelegators)
  }

  /**
   * Get information about the Governor contract.
   * @date 28.4.2023 - 01:17:14
   *
   * @async
   * @param {?number} [blockNumber] - The block number to fetch the information from. If not provided, uses the latest block.
   * @param {QueryOverrides<T.Governance>} [overrides={ contract: this._governor }] - Query overrides object.
   * @returns {Promise<T.GovernorInformation>} - Promise that resolves the Governor information
   */
  async getGovernorInfo(blockNumber?: number, overrides: QueryOverrides<T.Governance> = { contract: this._governor }): Promise<T.GovernorInformation> {
    const contract = this.#checkContract(overrides.contract, {
      position: 'getGovernorInfo',
      address: this._governor.address
    })

    try {
      const caller = new MultiCallApi()
      const headers = await new MultiCallApi().getGovernorInfo(contract)

      if (!blockNumber)
        blockNumber = caller.blockNumber ? caller.blockNumber.toNumber() : await contract.provider.getBlockNumber()

      const quorum = await contract.quorum(blockNumber - 20)
      return <T.GovernorInformation>{ ...headers, quorum }
    } catch (error) {
      console.error(`error multicall getGovernorInfo`, error)
      if (!blockNumber) blockNumber = await contract.provider.getBlockNumber()
      const votingPeriod = await contract.votingPeriod()
      const votingDelay = await contract.votingDelay()
      const proposalThreshold = await contract.proposalThreshold()
      const numerator = await contract['quorumNumerator()']()
      const quorum = await contract.quorum(blockNumber - 20)
      const mode = await contract.COUNTING_MODE()

      return <T.GovernorInformation>{
        votingPeriod: votingPeriod.toNumber(),
        votingDelay: votingDelay.toNumber(),
        proposalThreshold,
        numerator: numerator.toNumber(),
        quorum
      }
    }
  }

  /**
   * Queries all logs emitted by the governor contract.
   * @date 28.4.2023 - 01:32:43
   *
   * @async
   * @param {?(string | number)} [fromBlockOrHash] - The block number or block hash to start the query from (defaults to 0).
   * @param {T.Governance} [contract=this._governor] - The Governor contract instance to query.
   * @returns {Promise<QueryAllLogsResult>} - A promise that resolves to an object containing all logs for each event type.
   */
  async queryAllLogs(fromBlockOrHash?: string | number, contract: T.Governance = this._governor): Promise<QueryAllLogsResult> {
    const key = `query full logs - address: ${contract.address} - #${fromBlockOrHash || 0} - id: ${'3'.rndHex()}`
    if (this.debug) console.time(key)

    const result = {
      created: <T.ProposalCreatedEvent[]>await this.iterateLogs(contract, contract.filters.ProposalCreated(), fromBlockOrHash),
      executed: <T.ProposalExecutedEvent[]>await this.iterateLogs(contract, contract.filters.ProposalExecuted(), fromBlockOrHash),
      queued: <T.ProposalQueuedEvent[]>await this.iterateLogs(contract, contract.filters.ProposalQueued(), fromBlockOrHash),
      cancelled: <T.ProposalCanceledEvent[]>(
        await this.iterateLogs(contract, contract.filters.ProposalCanceled(), fromBlockOrHash)
      ),
      voteCast: <T.VoteCastEvent[]>await this.iterateLogs(contract, contract.filters.VoteCast(), fromBlockOrHash),
      voteCastWithParams: <T.VoteCastWithParamsEvent[]>(
        await this.iterateLogs(contract, contract.filters.VoteCastWithParams(), fromBlockOrHash)
      )
    }

    result.created.map((result) => this.eventLogs.created.set(result.transactionHash, result))
    result.executed.map((result) => this.eventLogs.executed.set(result.transactionHash, result))
    result.queued.map((result) => this.eventLogs.queued.set(result.transactionHash, result))
    result.cancelled.map((result) => this.eventLogs.cancelled.set(result.transactionHash, result))
    result.voteCast.map((result) => this.eventLogs.voteCast.set(result.transactionHash, result))
    result.voteCastWithParams.map((result) => this.eventLogs.voteCastWithParams.set(result.transactionHash, result))

    if (this.debug)
      console.timeLog(key, {
        created: result.created.length,
        executed: result.executed.length,
        queued: result.queued.length,
        cancelled: result.cancelled.length,
        voteCast: result.voteCast.length,
        voteCastWithParams: result.voteCastWithParams.length
      })

    return result
  }

  /**
   * Queries the contract event logs for ProposalCreated, VoteCast, and Comment events,
   * starting from the given block number or hash (if provided), up to the current block.
   * Returns an object containing arrays of the retrieved events.
   * @date 28.4.2023 - 01:19:37
   *
   * @async
   * @param {?(string | number)} [fromBlockOrHash] - Optional block number or block hash to start retrieving logs from
   * @param {T.Governance} [contract=this._governor] - Optional governance contract address to filter logs by
   * @returns {Promise<QueryLogsResult>} - An object containing arrays of ProposalCreated, VoteCast, and Comment events
   * retrieved from the contract logs
   */
  async queryLogs(fromBlockOrHash?: string | number, contract: T.Governance = this._governor): Promise<QueryLogsResult> {
    const key = `query logs - address: ${contract.address} - #${fromBlockOrHash || 0} - id: ${'3'.rndHex()} - took`
    if (this.debug) console.time(key)

    const result: QueryLogsResult = {
      created: <T.ProposalCreatedEvent[]>await this.iterateLogs(contract, contract.filters.ProposalCreated(), fromBlockOrHash),
      voteCast: <T.VoteCastEvent[]>await this.iterateLogs(contract, contract.filters.VoteCast(), fromBlockOrHash),
      comment: <T.CommentEvent[]>await this.iterateLogs(this._token, this._token.filters.Comment(), fromBlockOrHash),
    }

    result.created.map((result) => this.eventLogs.created.set(result.transactionHash, result))
    result.voteCast.map((result) => this.eventLogs.voteCast.set(result.transactionHash, result))

    if (this.debug) console.timeLog(key, `created: ${result.created.length} - voteCast: ${result.voteCast.length}`)
    return result
  }

  /**
   * Iterates over all events that match the given filter and contract, starting from the specified block or hash.
   * @date 28.4.2023 - 01:26:16
   *
   * @async
   * @template {C extends T.Contract} - The type of the contract to filter events from.
   * @template {F extends T.TypedEventFilter<any>} - The type of the filter to apply on events.
   * @param {C} contract - The contract to filter events from.
   * @param {F} filter - The filter to apply on events.
   * @param {?(string | number)} [fromBlockOrHash] - The block number or block hash to start iterating events from.
   * @returns {Promise<any[]>} - A Promise that resolves to an array of events matching the filter and contract.
   */
  async iterateLogs<C extends T.Contract, F extends T.TypedEventFilter<any>>(
    contract: C,
    filter: F,
    fromBlockOrHash?: string | number
  ): Promise<any[]> {
    try {
      const endBlock = await contract.provider.getBlockNumber()
      const startBlock = fromBlockOrHash
        ? await (async () => {
            if ((typeof fromBlockOrHash === 'string' && fromBlockOrHash.isKeccakHash()) || typeof fromBlockOrHash === 'number') {
              const { number } = await contract.provider.getBlock(fromBlockOrHash)
              return number
            }

            return 0
          })()
        : 0

      let allEvents: Event[] = []

      for (let i = startBlock; i < endBlock; i += this.maxLogBlocks) {
        const _startBlock = i
        const _endBlock = Math.min(endBlock, i + (this.maxLogBlocks - 1))
        const events = await contract.queryFilter(filter, _startBlock, _endBlock)
        allEvents = [...allEvents, ...events]
      }

      return allEvents
    } catch (error) {
      const e = error as { code: number }
      if (e.code === -32603) {
        if (this.maxLogBlocks > 1000) {
          this.maxLogBlocks = 1000
          console.warn(`slow node detected, limiting query logs to 1000 blocks`)
          return await this.iterateLogs(contract, filter)
        }
      }
      throw error
    }
  }

  /**
   * Returns statistics about events fetched by the queryApi instance.
   * @date 28.4.2023 - 01:28:41
   *
   * @returns {ApiStats}
   */
  getEventStats(): ApiStats {
    const totalVotes = this.eventLogs.voteCast.size
    const voters: Record<string, number> = {}
    const proposers: Record<string, string[]> = {}
    const totalProposers = Object.keys(proposers)
    const proposalIds: string[] = []

    this.eventLogs.voteCast.forEach((v) => {
      if (!Object.keys(voters).includes(v.args.voter)) {
        voters[v.args.voter] = 1
        return
      }
      voters[v.args.voter]++
    })

    this.eventLogs.created.forEach((v) => {
      if (!proposalIds.includes(v.args.proposalId.toString())) {
        proposalIds.push(v.args.proposalId.toString())
      }

      if (!Object.keys(proposers).includes(v.args.proposer)) {
        proposers[v.args.proposer] = [v.args.proposalId.toString()]
        return
      }
      proposers[v.args.proposer].push(v.args.proposalId.toString())
    })

    const uniqueVoters = uniq(Object.keys(voters))
    const totalProposals = proposalIds.length

    return <ApiStats>{ voters, uniqueVoters, totalVotes, totalProposers, proposers, proposalIds, totalProposals }
  }

  /**
   * Queries all Comment events emitted by the Governance contract.
   * @date 28.4.2023 - 01:29:35
   *
   * @async
   * @returns {Promise<T.CommentEvent[]>} - A promise that resolves to an array of CommentEvent objects.
   */
  async queryAllComments(): Promise<T.CommentEvent[]> {
    const filter = this._token.filters.Comment()
    const comments: T.CommentEvent[] = await this.iterateLogs(this._token, filter, 0)
    return comments
  }

  #mixInComments(proposals: T.Proposals, logs: T.CommentEvent[]) {
    for (const log of logs) {
      const p = proposals[log.args.proposalId.toString()]
      if (!p) continue
      if (!p.comments) p.comments = []
      if (!p.comments.find((c) => c.proposalId.eq(log.args.proposalId) && c.transactionHash === log.transactionHash)) {
        p.comments.push({
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          proposalId: log.args.proposalId,
          member: log.args.member,
          message: log.args.message,
          timestamp: log.args.timestamp
        })
      }

      proposals[log.args.proposalId.toString()] = p
    }

    return proposals
  }

  #checkContract<C extends Contract>(contract: C | undefined, i: { position?: string; address?: string } = {}) {
    if (!contract || !contract.address) throw new Error(`given input contract is undefined`)

    if (i.address && !i.address.addrIsEqual(contract.address)) {
      const message = `your provided contract (${contract.address}) conflicts with local contract (${i.address}).`
      if (this.debug) console.warn(message)
      return contract.attach(i.address) as C
      // throw new Error(`your provided contract (${contract.address}) conflicts with local contract (${i.address}).`)
    }

    return contract
  }
}
