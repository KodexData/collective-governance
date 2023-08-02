import type * as T from 'types'
import { CtxEthers, CtxState } from '..'
import { useSnackbar } from 'notistack'
import { id } from '@ethersproject/hash'
import { BigNumber } from '@ethersproject/bignumber'
import { loadCachedState, generateKey } from 'context/state/cache'
import { useErrorHandler, useForceUpdate, useInterval } from 'hooks'
import { createContext, useContext, useEffect, useMemo } from 'react'
import * as Api from '@collective-governance/api-evm'
import * as Utils from 'utils'
import { Utils as U } from '@kodex-data/prototypes'
import {
  DaoRegistry__factory,
  TimelockController__factory,
  Governance__factory,
  Treasury__factory,
  DaoToken__factory,
  ERC20__factory,
  DaoWrapped__factory
} from '@collective-governance/hardhat'
import * as Config from 'config'

export interface GovernanceContext {
  api: Api.QueryApi
  logout: () => Promise<void>
  getDaoRegistry(address?: string | undefined): T.DaoRegistry | undefined
  getGovernor(address?: string | undefined): T.Governance | undefined
  getTimelock(address?: string | undefined): T.TimelockController | undefined
  getDaoToken(address?: string | undefined): T.DaoToken | undefined
  getWrappedDaoToken(address?: string | undefined): T.DaoWrapped | undefined
  getTreasury(address?: string | undefined): T.Treasury | undefined
  initialize(contractAddress: string, source?: string): Promise<void>
  defaultContracts: Config.DcContracts
  defaultAbis: Api.DcAbis
  refetch(startBlock?: number): Promise<void>

  vote(proposalId: string, support: number, reason: string): Promise<void>
  queue(params: T.OperationParameters): Promise<void>
  cancel(params: T.OperationParameters): Promise<void>
  execute(params: T.OperationParameters): Promise<void>
  propose: (params: T.OperationParameters) => Promise<boolean>

  delegate: (address?: string) => Promise<void>
  getDelegationState(): Promise<void> | undefined
  checkHasVoted: (id: string) => Promise<boolean | undefined>
  resetCache: () => void
  getDefaultContracts: () => Config.ContractList | undefined
  getDefaultAddress: () => string | undefined
  refetchProposal(proposalId: string | BigNumber): Promise<T.Proposal | undefined>
  isValidERC20(address: string, bytecode?: string): Promise<boolean>
  isValidWrapped(address: string, bytecode?: string): Promise<boolean>
  deployERC20(name: string, symbol: string): Promise<T.DeployedResult<T.ERC20> | undefined>
  deployDaoWrapped(wrapped: string, name: string, symbol: string): Promise<T.DeployedResult<T.DaoWrapped> | undefined>
  getTknInfo(contract: T.DaoWrapped | T.DaoToken): Promise<T.TknInfo>
  getDaoRegister(address?: string): Promise<T.GovernorInformation[] | undefined>
}

export const CtxGovernance = createContext({} as GovernanceContext)

export interface GovernanceProviderProps {
  DEBUG?: boolean
  children?: React.ReactNode
}

const GovernanceProvider: React.FC<GovernanceProviderProps> = ({ children, DEBUG }) => {
  const update = useForceUpdate()
  const ctx = useContext(CtxState)
  const api = useMemo(() => new Api.QueryApi(), [])
  const ethers = useContext(CtxEthers)
  const { handleError } = useErrorHandler()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if (!ctx.state.loggedOut) {
      if (DEBUG) console.log(`logged in`)
      return
    }
    api.reset()
    if (DEBUG) console.log('logged out')
  }, [ctx.state.loggedOut])

  //prettier-ignore
  async function verifyRole (address: string, role: 'proposer' | 'executor' | 'canceler') {
    let _roles = { ...ctx.state.userRoles }
    
    if (_roles.user && _roles.user.addrIsEqual(address)) {
      const payload = await api.getUserRoles(address)
      _roles = { ...payload }

      if (_roles.user === address) ctx.dispatch({ type: 'set-user-roles', payload })
      else throw new Error(
        `cannot verify user roles, web3 signer address mismatch state.userRoles`
      )
    }

    switch(role) {
      case 'proposer':
        if (!_roles.isProposer && !_roles.isAdmin) throw new Error(
          `you are not allowed to propose`
        )
        break
      case 'executor':
        if (!_roles.isExecutor && !_roles.isAdmin) throw new Error(
          `you are not allowed to execute proposals`
        )
        break
      case 'canceler':
        if (!_roles.isCanceler && !_roles.isAdmin) throw new Error(
          `you are not allowed to cancel proposals`
        )
        break
    }
  }

  async function logout() {
    ctx.dispatch({ type: 'logout' })
  }

  function getDefaultContracts(): Config.ContractList | undefined {
    if (!ethers.state.chainId) return
    const k = ethers.state.chainId.toString() as Config.ChainsIds
    const contracts: Config.ContractList = Config.defaultContracts[k]
    return contracts
  }

  function getDefaultAddress() {
    return getDefaultContracts()?.Governance
  }

  function getDaoRegistry(address = ctx.state.contracts.DaoRegistry) {
    if (!ethers.provider || !address || !address.isAddress()) return
    return DaoRegistry__factory.connect(address, ethers.provider.getSigner())
  }

  function getGovernor(address = ctx.state.contracts.Governance) {
    if (!ethers.provider || !address || !address.isAddress()) return
    return Governance__factory.connect(address, ethers.provider.getSigner())
  }

  function getDaoToken(address = ctx.state.contracts.DaoToken) {
    if (!ethers.provider || !address || !address.isAddress()) return
    return DaoToken__factory.connect(address, ethers.provider.getSigner())
  }

  function getWrappedDaoToken(address = ctx.state.contracts.DaoToken) {
    if (!ethers.provider || !address || !address.isAddress()) return
    return DaoWrapped__factory.connect(address, ethers.provider.getSigner())
  }

  function getTimelock(address = ctx.state.contracts.TimelockController) {
    if (!ethers.provider || !address || !address.isAddress()) return
    return TimelockController__factory.connect(address, ethers.provider.getSigner())
  }

  function getTreasury(address = ctx.state.contracts.Treasury) {
    if (!ethers.provider || !address || !address.isAddress()) return
    return Treasury__factory.connect(address, ethers.provider.getSigner())
  }

  function cacheStartBlock() {
    if (Utils.isEmpty(ctx.state.proposals)) return undefined
    return U.max(Object.values(ctx.state.proposals).map((p) => p.blockNumber))?.toNumber()
  }

  async function isValidERC20(address: string, bytecode?: string) {
    return await Api.checkBytecode(Api.isERC20, { address, bytecode, provider: ethers.provider })
  }

  async function isValidWrapped(address: string, bytecode?: string) {
    const f = (b: string) => Api.isERC20(b) && b.includes('2f4f21e2') && b.includes('205c2878')
    return await Api.checkBytecode(f, { address, bytecode, provider: ethers.provider })
  }

  async function deployERC20(name: string, symbol: string): Promise<T.DeployedResult<T.ERC20> | undefined> {
    if (!ethers.provider) return
    const signer = ethers.provider.getSigner()
    const token = await new ERC20__factory(signer!).deploy(name, symbol)
    const { hash: deployTx, blockNumber } = token.deployTransaction
    return { address: token.address, token, deployTx, blockNumber } as T.DeployedResult<T.ERC20>
  }

  async function deployDaoWrapped(
    wrapped: string,
    name: string,
    symbol: string
  ): Promise<T.DeployedResult<T.DaoWrapped> | undefined> {
    if (!ethers.provider || !(await isValidERC20(wrapped))) return
    const signer = ethers.provider.getSigner()
    const token = await new DaoWrapped__factory(signer!).deploy(wrapped, await signer.getAddress(), name, symbol)
    const { hash: deployTx, blockNumber } = token.deployTransaction
    return { address: token.address, token, deployTx, blockNumber } as T.DeployedResult<T.DaoWrapped>
  }

  async function getTknInfo(contract: T.DaoWrapped | T.DaoToken) {
    const isWrapped = (obj: any): obj is T.DaoWrapped => {
      return obj && 'address' in obj
    }

    const tknInfo: T.TknInfo = {
      address: contract.address,
      name: await contract.name(),
      symbol: await contract.symbol(),
      decimals: await contract.decimals(),
      totalSupply: await contract.totalSupply().then((n) => n.toString())
    }

    if ((await isValidWrapped(contract.address)) && isWrapped(contract)) {
      tknInfo.underlying = await contract.underlying()
    }

    return tknInfo
  }

  const resetCache = () => {
    if (!ctx.state.chainId || !ctx.state.contracts.Governance) return
    const key = generateKey(ctx.state.chainId, ctx.state.contracts.Governance)
    localStorage.removeItem(key)
    window.location.reload()
  }

  const initialize = async (contractAddress: string, source?: string) => {
    if (!ethers.provider || !contractAddress || !contractAddress.isAddress()) return
    if (!Api.isGovernor(await ethers.provider.getCode(contractAddress))) {
      enqueueSnackbar(`given contract address is not a valid governor contract`, { variant: 'error' })
      return
    }

    if (source) console.debug(`setGovernance triggered by:`, source)
    if (!api.isInitialized || !contractAddress.addrIsEqual(api.contractAddresses.governor)) {
      await api.initialize({ provider: ethers.provider, governor: contractAddress })
      console.debug(`api initialized`, api.contractAddresses)
    }

    // will only load cache when the initial proposal state is empty.
    if (Utils.isEmpty(ctx.state.proposals))
      try {
        const cached: T.State = Utils.parseAllBigNumbers(loadCachedState(ethers.state.chainId!, contractAddress))

        if (cached) {
          console.debug(`cached state loaded:`, cached)
          if (cached.chainId !== ethers.state.chainId) {
            console.warn(`WARNING CACHE LOAD: chain id mismatch`, cached.chainId, ethers.state.chainId)
          }
        }
        if (cached && cached.timelockInformation?.minDelay instanceof BigNumber) {
          ctx.dispatch({ type: 'set-all', payload: cached })
          ctx.dispatch({ type: 'set-is-initialized', payload: true })
          ctx.dispatch({ type: 'set-is-loading', payload: false })
          return
        }
      } catch (error) {
        handleError(error)
      }

    ctx.dispatch({ type: 'set-is-loading', payload: true })
    const blockNumber = await ethers.provider.getBlockNumber()
    const governance = getGovernor(contractAddress)!
    const tokenAddress = await governance.token()
    const timelockAddress = await governance.timelock()

    try {
      const quorum = await governance.quorum(blockNumber - 20)
      ctx.dispatch({ type: 'set-quorum', payload: quorum })
    } catch (error) {
      handleError(error)
    }

    ctx.dispatch({ type: 'set-chain-id', payload: ethers.state.chainId! })

    ctx.dispatch({
      type: 'set-governor',
      payload: contractAddress
    })

    if (tokenAddress)
      ctx.dispatch({
        type: 'set-dao-token',
        payload: tokenAddress
      })

    if (timelockAddress)
      ctx.dispatch({
        type: 'set-timelock',
        payload: timelockAddress
      })

    ctx.dispatch({ type: 'set-is-initialized', payload: true })
  }

  async function refetchProposal(proposalId: string | BigNumber): Promise<T.Proposal | undefined> {
    if (!ctx.state.contracts.Governance) return
    ctx.dispatch({ type: 'set-is-loading', payload: true })
    const key = `refetchProposal - id: ${'3'.rndHex()} proposal: ${proposalId}`
    if (DEBUG) console.time(key)

    const governance = getGovernor()!

    try {
      const previous = ctx.state.proposals[proposalId.toString()]
      const current = await api.updateProposal(previous, { contract: governance })
      console.log({ previous, current })
      ctx.dispatch({ type: 'update-proposal', payload: current })
      if (DEBUG) console.timeLog(key, `proposal refetch result:`, current)
    } catch (error) {
      console.warn(`error refetchProposal: ${proposalId}`, error)
      await refetch(cacheStartBlock())
    }

    ctx.dispatch({ type: 'set-is-loading', payload: false })
    return ctx.state.proposals[proposalId.toString()]
  }

  async function refetch(startBlock = 0) {
    if (!ctx.state.contracts.Governance || !api) return
    ctx.dispatch({ type: 'set-is-loading', payload: true })

    const key = `refetch - id: ${'3'.rndHex()} - block: #${startBlock} - took`
    if (DEBUG) console.time(key)

    const contract = getGovernor()!

    try {
      ctx.dispatch({ type: 'set-governor-information', payload: await api.getGovernorInfo() })
      const proposals = await api.buildProposalBoard(startBlock, { contract, source: key })
      ctx.dispatch({ type: 'set-proposals', payload: proposals })
      if (DEBUG) console.timeLog(key, `- build proposals`)
      const tokenInfo = await api.getTokenInfo({ contract: getDaoToken() })
      ctx.dispatch({ type: 'set-token-info', payload: tokenInfo })
      if (DEBUG) console.timeLog(key, `- query token infos`)

      update()
    } catch (error) {
      handleError(error)
    }

    ctx.dispatch({ type: 'set-is-loading', payload: false })
    if (DEBUG) console.timeLog(key, `- refetching data done`)
  }

  async function vote(proposalId: string, support: number, reason: string) {
    const governor = getGovernor()
    if (!governor || !ethers.state.blockNumber) return
    let receipt: T.ContractReceipt
    
    try {
      if (await governor.hasVoted(proposalId, governor.address || await governor.signer.getAddress())) {
        throw new Error(`cannot vote on proposal, you have already voted!`)
      }

      if (typeof reason === 'string' && reason.length > 0) {
        const gasLimit = await governor.estimateGas.castVoteWithReason(proposalId, support, reason)
        const overrides = { gasLimit: gasLimit.add(gasLimit.div(10)) }
        receipt = await governor.castVoteWithReason(proposalId, support, reason, overrides).then((t) => t.wait(1))
      } else {
        const gasLimit = await governor.estimateGas.castVote(proposalId, support)
        const overrides = { gasLimit: gasLimit.add(gasLimit.div(10)) }
        receipt = await governor.castVote(proposalId, support, overrides).then((t) => t.wait(1))
      }

      ctx.dispatch({ type: 'add-receipt', payload: receipt })
      enqueueSnackbar(receipt.transactionHash, { variant: 'success' })
    } catch (error) {
      handleError(error, governor)
    }
  }

  async function queue(params: T.OperationParameters) {
    const governor = getGovernor()
    if (!governor || !ethers.provider) return
    try {
      const [targets, values, calldatas, description] = params
      const descHash = id(description)
      const gasLimit = await governor.estimateGas.queue(targets, values, calldatas, descHash)
      const overrides = { gasLimit: gasLimit.add(gasLimit.div(10)) }
      const txResponse = await governor.queue(targets, values, calldatas, descHash, overrides)
      const receipt = await txResponse.wait(1)
      ctx.dispatch({ type: 'add-receipt', payload: receipt })
      enqueueSnackbar(receipt.transactionHash, { variant: 'success' })
    } catch (error) {
      handleError(error, governor)
    }
  }

  async function cancel(params: T.OperationParameters) {
    const timelock = getTimelock()
    const governor = getGovernor()
    if (!timelock || !governor) return
    try {
      verifyRole(await governor.signer.getAddress(), 'canceler')
      const [targets, values, calldatas, description] = params
      const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000'
      const queueId = await timelock.hashOperationBatch(targets, values, calldatas, ZERO_BYTES, id(description))
      const receipt = await timelock.cancel(queueId, { gasLimit: 500000 }).then((res) => res.wait(1))
      ctx.dispatch({ type: 'add-receipt', payload: receipt })
      enqueueSnackbar(receipt.transactionHash, { variant: 'success' })
    } catch (error) {
      handleError(error, timelock)
    }
  }

  async function execute(params: T.OperationParameters) {
    const governor = getGovernor()
    if (!governor || !ethers.provider || !ethers.state.block) return

    try {
      verifyRole(await governor.signer.getAddress(), 'executor')
      const [targets, values, calldatas, description] = params
      const descHash = id(description)
      const gasLimit = await governor.estimateGas.execute(targets, values, calldatas, descHash)
      const overrides = { gasLimit: gasLimit.add(gasLimit.div(10)) }
      const txResponse = await governor.execute(targets, values, calldatas, descHash, overrides)
      const receipt = await txResponse.wait(1)
      ctx.dispatch({ type: 'add-receipt', payload: receipt })
      enqueueSnackbar(receipt.transactionHash, { variant: 'success' })
    } catch (error) {
      handleError(error, governor)
    }
  }

  async function propose(params: T.OperationParameters | undefined): Promise<boolean> {
    const governor = getGovernor()
    if (!params || !ethers.provider || !governor) return true
    let errored = false
    try {
      verifyRole(await governor.signer.getAddress(), 'proposer')
      const [targets, values, calldatas, description] = params
      if (!Utils.HAS_VALID_HEADLINE.test(description)) {
        throw new Error(`Invalid Description - HAS_VALID_HEADLINE`)
      }
      const gasLimit = await governor.estimateGas.propose(targets, values, calldatas, description)
      const overrides = { gasLimit: gasLimit.add(gasLimit.div(10)) }
      const txResponse = await governor.propose(targets, values, calldatas, description, overrides)
      const receipt = await txResponse.wait(1)
      ctx.dispatch({ type: 'add-receipt', payload: receipt })
      enqueueSnackbar(receipt.transactionHash, { variant: 'success' })
    } catch (error) {
      handleError(error, governor)
      errored = true
    }

    return errored
  }

  function getDelegationState() {
    if (!ethers.state.address || !api) return
    const contract = getDaoToken()
    if (!contract) return
    const { tokenInfo } = ctx.state

    return api
      .getDelegationState(ethers.state.address, tokenInfo?.totalSupply, { contract })
      .then((payload) => {
        ctx.dispatch({ type: 'set-delegation', payload })
      })
      .catch(handleError)
  }

  async function delegate(address?: string) {
    if (!ethers.provider) return
    if (address && !address.isAddress()) return
    else {
      if (!ethers.state.address || !ethers.state.address.isAddress()) return
    }

    const contract = getDaoToken()!
    try {
      const txResponse = await contract.delegate(address || ethers.state.address)
      await txResponse.wait(1)
    } catch (error) {
      handleError(error, contract)
    }

    return getDelegationState()
  }

  async function checkHasVoted(id: string) {
    if (!ethers.state.address || !ethers.state.address.isAddress()) return
    const governor = getGovernor()
    if (governor)
      try {
        const votes = await governor.getVotes(ethers.state.address, ethers.state.blockNumber! - 10)
        if (votes.gt(0)) return await governor.hasVoted(id, ethers.state.address)
        else return true // hiding buttons :P
      } catch (error) {
        handleError(error)
      }
    return
  }

  async function getDaoRegister(address?: string): Promise<T.GovernorInformation[] | undefined> {
    if (!ctx.state.contracts.DaoRegistry && !address) return
    const contractAddresses = await getDaoRegistry(address)!.allDAOs()
    const payload = await Promise.all(contractAddresses.map((address) => api.getGovernorInfo(undefined, { contract: getGovernor(address) })))
    ctx.dispatch({ type: 'set-dao-register', payload })
    return payload
  }

  useEffect(() => {
    if (!ctx.state.contracts.TimelockController || !api || !api._timelock) return
    if (!ctx.state.contracts.TimelockController.isAddress()) return
    if (!ethers.state.address || !ethers.state.address.isAddress()) return

    const contract = getTimelock(ctx.state.contracts.TimelockController)!
    api
      .getUserRoles(ethers.state.address!, { contract })
      .then((payload) => {
        console.debug(`user roles loaded: ${ethers.state.address!}`)
        ctx.dispatch({ type: 'set-user-roles', payload })
        ctx.dispatch({ type: 'set-timelock-information', payload: payload.timelockInfo })
        update()
      })
      .catch(handleError)

    // eslint-disable-next-line
  }, [ethers.state.address, ctx.state.contracts.TimelockController])

  useEffect(() => {
    if (!ethers.state.address || !ctx.state.tokenInfo) return
    getDelegationState()
  }, [ethers.state.address, ctx.state.tokenInfo])

  useEffect(() => {
    if (!ctx.state.contracts.DaoToken || !api || !api._token) return
    const contract = getDaoToken()!

    api
      .getTokenInfo({ contract })
      .then((payload) => {
        ctx.dispatch({ type: 'set-token-info', payload })

        // api.getTokenBalances(contract.address, payload.members)
        api.getAllDelegators({ contract }).then((payload) => {
          ctx.dispatch({ type: 'set-delegators', payload: payload })
        })
      })
      .catch(handleError)
  }, [ctx.state.contracts.DaoToken])

  useEffect(() => {
    if (!ctx.state.contracts.Governance || !api || !api._governor) return
    const { Governance } = ctx.state.contracts
    console.debug(`trigger - Governance: ${Governance}`)
    const contract = getGovernor()!
    if (!contract) {
      console.warn(`WARNING getGovernor returned null`, ctx.state)
      return
    }

    const startBlock = cacheStartBlock()
    const source = `useEffect api, Governance`
    api
      .buildProposalBoard(startBlock, { contract, source })
      .then((proposals) => {
        ctx.dispatch({ type: 'set-proposals', payload: proposals })
        ctx.dispatch({ type: 'set-is-loading', payload: false })
        enqueueSnackbar(`governance ${Governance} reloaded #${startBlock || 0}`, { variant: 'success' })
      })
      .catch(handleError)

    api
      .getGovernorInfo(undefined, { contract })
      .then((payload) => {
        ctx.dispatch({ type: 'set-governor-information', payload })
        console.debug(`governor information`, payload)
      })
      .catch(handleError)
    // eslint-disable-next-line
  }, [ctx.state.contracts.Governance])

  useEffect(() => {
    if (!ctx.state.contracts.Treasury || !api || !api._treasury) return
    console.debug(`trigger treasury: ${ctx.state.contracts.Treasury}`)
    const contract = getTreasury(ctx.state.contracts.Treasury)!

    api
      .getTreasuryBalances({ contract })
      .then((balances) => {
        ctx.dispatch({ type: 'set-treasury-balances', payload: balances })
      })
      .catch(handleError)
  }, [ctx.state.contracts.Treasury])

  useInterval(() => getDelegationState(), 10000, true)

  const { start, stop } = useInterval(
    async () => {
      await refetch(cacheStartBlock())
    },
    1 * 1e3 * 360,
    true
  )

  const handlers: Api.ContractEventHandlers = {
    created: (...args) => {
      //prettier-ignore
      const[
        proposalId, proposer, targets, values, signatures,
        calldatas, startBlock, endBlock, description
      ] = args

      //prettier-ignore
      const payload = {
        proposalId, proposer, targets, values, signatures,
        calldatas, startBlock, endBlock, description
      }

      console.debug(`GovernanceEvent: ProposalCreated - id: ${proposalId}`, payload)
      refetch(cacheStartBlock())
    },
    canceled: (...args) => {
      const [proposalId] = args
      console.debug(`GovernanceEvent: ProposalCanceled - id: ${proposalId}`)
      refetchProposal(proposalId)
    },
    queued: async (...args) => {
      const [proposalId, eta] = args
      console.debug(`GovernanceEvent: ProposalQueued - eta: ${eta} - id: ${proposalId}`)
      refetchProposal(proposalId)
    },
    executed: (...args) => {
      const [proposalId] = args
      console.debug(`GovernanceEvent: ProposalExecuted - id: ${proposalId}`)
      refetchProposal(proposalId)
    },
    voteCast: (...args) => {
      const [voter, proposalId, support, weight, reason] = args
      const payload = { voter, proposalId, support, weight, reason }
      console.debug(`GovernanceEvent: VoteCast`, payload)
      refetch(cacheStartBlock())
    },
    quorumNumeratorUpdate: (...args) => {
      const [oldQuorumNumerator, newQuorumNumerator] = args
      console.debug(`GovernanceEvent: QuorumNumeratorUpdated - old: ${oldQuorumNumerator} new: ${newQuorumNumerator}`)
      ctx.dispatch({ type: 'set-numerator', payload: newQuorumNumerator.toNumber() })
      refetch(cacheStartBlock())
    },
    proposalThresholdSet: (...args) => {
      const [oldProposalThreshold, newProposalThreshold] = args
      console.debug(`GovernanceEvent: ProposalThresholdSet - old: ${oldProposalThreshold} new: ${newProposalThreshold}`)
      ctx.dispatch({ type: 'set-proposal-threshold', payload: newProposalThreshold })
      refetch(cacheStartBlock())
    },
    votingPeriodSet: (...args) => {
      const [oldVotingPeriod, newVotingPeriod] = args
      console.debug(`GovernanceEvent: VotingPeriodSetEvent - old: ${oldVotingPeriod} new: ${newVotingPeriod}`)
      ctx.dispatch({ type: 'set-voting-period', payload: newVotingPeriod.toNumber() })
      refetch(cacheStartBlock())
    },
    votingDelaySet: (...args) => {
      const [oldVotingDelay, newVotingDelay] = args
      console.debug(`GovernanceEvent: VotingDelaySetEvent - old: ${oldVotingDelay} new: ${newVotingDelay}`)
      ctx.dispatch({ type: 'set-voting-delay', payload: newVotingDelay.toNumber() })
      refetch(cacheStartBlock())
    }
  }

  useEffect(() => {
    if (!ctx.state.contracts.Governance) return
    const address = ctx.state.contracts.Governance
    const governor = getGovernor(address)!
    const filters = Api.createGovernanceEvents(governor)

    Api.iterateEventHandlers(filters, handlers, (filter, handler, name) => {
      console.debug(`initialize listener: ${name}`)
      governor.on(filter, handler)
    })

    start()

    return () => {
      Api.iterateEventHandlers(filters, handlers, (filter, handler, name) => {
        governor.off(filter, handler)
        console.debug(`remove listener: ${name}`)
      })
      stop()
    }
  }, [ctx.state.contracts.Governance])

  useEffect(() => {
    if (!ctx.state.contracts.DaoToken) return
    const address = ctx.state.contracts.DaoToken
    const token = getDaoToken(address)!
    if (typeof token.filters.Comment === 'undefined') return

    const handleRefetch: any = (...data: any[]) => {
      refetch()
    }

    token.on(token.filters.Comment(), handleRefetch)
    token.on(token.filters.CommentThresholdSet(), handleRefetch)

    return () => {
      token.off(token.filters.Comment(), handleRefetch)
      token.off(token.filters.CommentThresholdSet(), handleRefetch)
    }
  }, [ctx.state.contracts.DaoToken])

  useEffect(() => {
    if (!ctx.state.contracts.DaoRegistry) return
    getDaoRegister(ctx.state.contracts.DaoRegistry)
  }, [ctx.state.contracts.DaoRegistry])

  useEffect(() => {
    if (!ethers.provider) return
    console.debug(`provider did change`)
    ctx.dispatch({ type: 'reset' })
    setTimeout(() => refetch(), 500)
  }, [ethers.provider])

  // prettier-ignore
  return (
    <CtxGovernance.Provider
      value={{
        getDaoRegistry, getDelegationState, checkHasVoted,
        getGovernor, getDaoToken, getTimelock, getTreasury,
        propose, vote, queue, cancel, execute, initialize,
        defaultContracts: Config.defaultContracts, delegate,
        defaultAbis: Api.defaultAbis, refetch, resetCache,
        getDefaultContracts, getDefaultAddress, logout,
        refetchProposal, api, isValidERC20, deployERC20, 
        deployDaoWrapped, getWrappedDaoToken, isValidWrapped,
        getTknInfo, getDaoRegister,
      }}
    >
      {children}
    </CtxGovernance.Provider>
  )
}

export default GovernanceProvider
