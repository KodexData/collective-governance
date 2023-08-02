import type * as T from './types'
import * as Defaults from './defaults'
import * as Helpers from './helpers'

import { MultiCall } from '@kodex-data/multicall'
import { BigNumber } from '@ethersproject/bignumber'

import { uniq } from 'lodash'
import { id } from '@ethersproject/hash'

function isOdd(input: number) {
  return input % 2 === 1
}

export class MultiCallApi extends MultiCall {
  debug = false
  async getDelegationState(c: T.DaoToken, address: string) {
    const iface = Defaults.iFace.DaoToken
    const result: Partial<T.DelegationInformation> = { address }

    //prettier-ignore
    for (const method of Defaults.delegationStateMethods) {
      switch (method) {
        case 'totalSupply':
          this.$fn.addOperation({
            abi: iface.getFunction(method), parameters: {}, target: c.address,
            callData: iface.encodeFunctionData(method as any)
          })
          break
        default:
          this.$fn.addOperation({
            abi: iface.getFunction(method), parameters: { 0: address }, target: c.address,
            callData: iface.encodeFunctionData(method as any, [address])
          })
          break
      }
    }

    const operated = await this.$fn.aggregate(c.provider)

    for (const operation of operated) {
      const method = Defaults.delegationStateMethods[operation.index!]
      switch (method) {
        case 'delegates':
          result.delegates = operation.resultValue as string
          break
        case 'balanceOf':
          result.balance = operation.resultValue as BigNumber
          break
        case 'getVotes':
          result.votes = operation.resultValue as BigNumber
          break
        case 'totalSupply':
          result.totalSupply = operation.resultValue as BigNumber
      }
    }

    return result as T.DelegationInformation
  }

  async getGovernorInfo(c: T.Governance) {
    const iface = Defaults.iFace.Governance
    const target = c.address
    const result: Partial<T.GovernorInformation> = {}

    for (const method of Defaults.governorInfoMethods) {
      //prettier-ignore
      this.$fn.addOperation({
        abi: iface.getFunction(method), parameters: {}, target,
        callData: iface.encodeFunctionData(method as any),
      })
    }

    const operated = await this.$fn.aggregate(c.provider)

    for (const operation of operated) {
      const method = Defaults.governorInfoMethods[operation.index!]

      switch (method) {
        case 'votingPeriod':
          if (MultiCall.isBigNumber(operation.resultValue)) {
            result.votingPeriod = operation.resultValue.toNumber()
          }
          break
        case 'votingDelay':
          if (MultiCall.isBigNumber(operation.resultValue)) {
            result.votingDelay = operation.resultValue.toNumber()
          }
          break
        case 'proposalThreshold':
          if (MultiCall.isBigNumber(operation.resultValue)) {
            result.proposalThreshold = operation.resultValue
          }
          break
        case 'quorumNumerator()':
          if (MultiCall.isBigNumber(operation.resultValue)) {
            result.numerator = operation.resultValue.toNumber()
          }
          break
        case 'COUNTING_MODE':
          result.mode = String(operation.resultValue)
          break
      }
    }

    return result
  }

  async getTokenInfos(c: T.DaoToken) {
    const iface = Defaults.iFace.DaoToken
    const result: { [key: string]: any } = {
      address: c.address
    }

    // @note until full merge this will be optional
    let skipCommentThreshold = true
    
    if (c.provider) {
      const bytecode = await c.provider.getCode(c.address)
      if (bytecode.includes(Defaults.commentTopic.strip0x())) {
        skipCommentThreshold = false
      }
    }

    for (const method of Defaults.tokenInfoMethods) {
      if (skipCommentThreshold && method === 'commentThreshold') continue
      this.$fn.addOperation({
        abi: iface.getFunction(method),
        parameters: {},
        callData: iface.encodeFunctionData(method as any),
        target: c.address
      })
    }

    const operated = await this.$fn.aggregate(c.provider)
    for (const operation of operated) {
      const method = Defaults.tokenInfoMethods[operation.index!]
      if (method === 'allMembers') {
        result['members'] = operation.resultValue!
      } else {
        result[method] = operation.resultValue!
      }
    }

    return result as T.TokenInformation
  }

  async getTimelockInfo(c: T.TimelockController): Promise<T.TimelockInformation> {
    const iface = Defaults.iFace.TimelockController
    const result: Partial<T.TimelockInformation> = {
      address: c.address,
      roles: {} as any
    }

    for (const method of Defaults.timelockInfoMethods) {
      this.$fn.addOperation({
        abi: iface.getFunction(method),
        parameters: {},
        callData: iface.encodeFunctionData(method as any),
        target: c.address
      })
    }

    const operated = await this.$fn.aggregate(c.provider)
    for (const operation of operated) {
      const method = Defaults.timelockInfoMethods[operation.index!]
      if (method === 'getMinDelay') {
        result.minDelay = operation.resultValue! as BigNumber
      } else {
        const key: keyof T.TimelockInformation['roles'] = method as any
        if (typeof operation.resultValue === 'string') {
          result.roles![key] = operation.resultValue!
        }
      }
    }

    return result as T.TimelockInformation
  }

  async getUserRoles(c: T.TimelockController, user?: string): Promise<T.UserRoles & { timelockInfo: T.TimelockInformation }> {
    if (!user || !user.isAddress()) user = await c.signer.getAddress()
    const iface = Defaults.iFace.TimelockController
    const timelockInfo = await this.getTimelockInfo(c)
    const result: Partial<T.UserRoles & { timelockInfo: T.TimelockInformation }> = { user, timelockInfo }

    //prettier-ignore
    for (const x of Object.values(timelockInfo.roles)) {
      this.$fn.addOperation({
        callData: iface.encodeFunctionData('hasRole', [x, user]),
        abi: iface.getFunction('hasRole'), target: c.address,
        parameters: { 0: x, 1: user }
      })
    }

    for (const operation of await this.$fn.aggregate(c.provider)) {
      const role: string = operation.parameters[0]

      if (Object.values(timelockInfo.roles).includes(role)) {
        const value = Boolean(operation.resultValue)
        switch (role) {
          case timelockInfo.roles.CANCELLER_ROLE:
            result.isCanceler = value
            break
          case timelockInfo.roles.EXECUTOR_ROLE:
            result.isExecutor = value
            break
          case timelockInfo.roles.PROPOSER_ROLE:
            result.isProposer = value
            break
          case timelockInfo.roles.TIMELOCK_ADMIN_ROLE:
            result.isAdmin = value
            break
        }
      }
    }

    return result as T.UserRoles & { timelockInfo: T.TimelockInformation }
  }

  async getDelegatorVotes(c: T.DaoToken, delegators: string[]): Promise<T.DelegatorVoteItem[]> {
    const result: T.DelegatorVoteItem[] = []
    const iface = c.interface.getFunction('getVotes')

    for (const delegatee of uniq(delegators)) {
      const callData = c.interface.encodeFunctionData('getVotes', [delegatee])
      const parameters = { 0: delegatee }
      const target = c.address
      this.$fn.addOperation({ target, callData, abi: iface, parameters })
    }

    for (const { parameters, resultValue } of await this.$fn.aggregate(c.provider)) {
      if (resultValue instanceof BigNumber)
        result.push({
          delegator: parameters[0],
          votes: resultValue
        })
    }

    return result
  }

  private proposalResultSwitch(method: Defaults.RefreshProposalMethods, prop: Partial<T.Proposal>, resultValue: any) {
    if (!prop) prop = {}
    if (!prop.forVotes) prop.forVotes = []
    if (!prop.abstainVotes) prop.abstainVotes = []
    if (!prop.againstVotes) prop.againstVotes = []

    switch (method) {
      case 'proposalVotes':
        if (MultiCall.isResult(resultValue)) {
          prop._forVotes = resultValue.forVotes
          prop._againstVotes = resultValue.againstVotes
          prop._abstainVotes = resultValue.abstainVotes
        }
        break
      case 'proposalSnapshot':
        prop!.snapshot = (<BigNumber>resultValue).toNumber()
        break
      case 'proposalEta':
        prop!.eta = (<BigNumber>resultValue).toNumber()
        break
      case 'proposalDeadline':
        prop!.deadline = (<BigNumber>resultValue).toNumber()
        break
      case 'state':
        prop.status = Number(resultValue)
        prop._status = Helpers.parseProposalState(prop.status!)
        prop.isActive = prop.status === 1
        break
      case 'quorum':
        prop.quorum = <BigNumber>resultValue
        break
    }

    return prop
  }

  async refetchProposal(c: T.Governance, proposalId: string | BigNumber, startBlock?: number | BigNumber): Promise<Partial<T.Proposal>> {
    const key = `MultiCallApi: refetchProposal - id ${proposalId} - #${startBlock || 'NULL'} - id: ${'3'.rndHex()}`
    if (this.debug) console.time(key)
    const target = c.address
    let prop: Partial<T.Proposal> = {
      id: proposalId.toString(),
      isActive: true
    }

    for (const method of Defaults.refreshProposalMethods) {
      const iface = c.interface.getFunction(method)
      const parameters = { 0: proposalId }
      const callData = c.interface.encodeFunctionData(method as any, [proposalId])
      this.$fn.addOperation({ target, callData, abi: iface, parameters })
    }

    if (startBlock) {
      startBlock = BigNumber.from(startBlock)
      const abi = c.interface.getFunction('quorum')
      const callData = c.interface.encodeFunctionData('quorum', [startBlock])
      this.$fn.addOperation({ abi, parameters: { 0: startBlock }, target, callData })
    }

    for (const { resultValue, index, signature } of await this.$fn.aggregate(c.provider)) {
      const method = Defaults.refreshProposalMethods[index as any]
      if (method && !signature!.includes('quorum')) {
        prop = { ...prop, ...this.proposalResultSwitch(method, prop, resultValue) }
      }

      if (signature!.includes('quorum')) {
        if (!(prop._forVotes instanceof BigNumber)) {
          prop._forVotes = BigNumber.from(0)
        }

        if (!(prop._againstVotes instanceof BigNumber)) {
          prop._againstVotes = BigNumber.from(0)
        }

        const quorum = resultValue as BigNumber
        const forVotes = BigNumber.from(prop._forVotes || 0)
        const againstVotes = BigNumber.from(prop._againstVotes || 0)
        const quorumReached = forVotes.gt(quorum!)
        const _percentage = forVotes.gt(0) ? Helpers.calcQuorumState(quorum!, forVotes) : 0
        const percentage = Number(_percentage.toFixed(2))

        prop.quorum = quorum
        prop.quorumReached = quorumReached
        prop.percentage = percentage
      }
    }

    if (this.debug) console.timeLog(key, prop)

    return prop
  }

  async fetchProposalBoard(c: T.Governance, proposalIds: (string | BigNumber)[], currentBlock?: number) {
    const key = `MultiCallApi: fetchProposalBoard - #${currentBlock || 'NULL'} - id: ${'3'.rndHex()}`
    if (this.debug) console.time(key)
    const target = c.address
    const result: T.Proposals = {}

    for (const proposalId of proposalIds) {
      console.debug(`fetching data for proposal id: ${proposalId}`)
      let prop: Partial<T.Proposal> = {
        id: proposalId.toString(),
        isActive: true
      }

      for (const method of Defaults.refreshProposalMethods) {
        const iface = c.interface.getFunction(method)
        const parameters = { 0: proposalId }
        const callData = c.interface.encodeFunctionData(method as any, [proposalId])
        this.$fn.addOperation({ target, callData, abi: iface, parameters })
      }

      result[proposalId.toString()] = prop as any
    }

    const operated = await this.$fn.aggregate(c.provider)

    for (const index in operated) {
      const operation = operated[index]
      const proposalId = operation.parameters[0]
      const method: any = operation.signature?.split('(')[0]!

      result[proposalId] = this.proposalResultSwitch(method, result[proposalId], operation.resultValue) as any
    }

    if (this.debug) console.timeLog(key, result, `operations: ${operated.length}`)

    return result
  }
  
  /**
   * fetches all proposal dependencies that relies on snapshot blockheight.
   * @date 22.2.2023 - 15:22:01
   *
   * @async
   * @param {T.Governance} c
   * @param {T.DaoToken} t
   * @param {T.ProposalBlockRelated[]} inputs
   * @returns {Promise<T.ProposalBlockRelated[]>}
   */
  async fetchProposalBlockDependencies(c: T.Governance, t: T.DaoToken, inputs: T.ProposalBlockRelated[]): Promise<T.ProposalBlockRelated[]> {
    try {
      for (const input of inputs) {
        this.$fn.addOperation({
          abi: c.interface.getFunction('quorum'),
          parameters: { 0: input.startBlock },
          callData: c.interface.encodeFunctionData('quorum', [input.startBlock]),
          target: c.address
        })

        this.$fn.addOperation({
          abi: t.interface.getFunction('getPastTotalSupply'),
          parameters: { 0: input.startBlock },
          callData: t.interface.encodeFunctionData('getPastTotalSupply', [input.startBlock]),
          target: t.address
        })
      }

      const operated = await this.$fn.aggregate(c.provider)
      if (operated.length !== inputs.length * 2) throw new Error(`MultiCallApi: input and output array length mismatch`)

      if (this.debug) console.log('operated', operated)

      let i = 0
      for (const operation of operated) {
        if (isOdd(operation.index!)) {
          inputs[i].pastTotalSupply = operation.resultValue as BigNumber
        } else {
          inputs[i].quorum = operation.resultValue as BigNumber
        }

        if (operation.index! > 0 && operation.index! % 2 === 0) i++
      }

      return inputs
    } catch (error) {
      console.warn(`error fetching fetchProposalBlockDependencies`, inputs, error)
      return []
    }
  }

  
  /**
   * builds entire proposal board.
   * @date 22.2.2023 - 15:21:18
   *
   * @async
   * @param {T.Governance} contract
   * @param {T.DaoToken} token
   * @param {(Pick<T.AllGovernanceLogs, 'created' | 'voteCast' | 'comments'>)} allLogs
   * @param {?number} [currentBlock]
   * @returns {Promise<T.Proposals>}
   */
  async buildProposalBoard(
    contract: T.Governance,
    token: T.DaoToken,
    allLogs: Pick<T.AllGovernanceLogs, 'created' | 'voteCast' | 'comments'> ,
    currentBlock?: number
  ): Promise<T.Proposals> {
    const ids = allLogs.created.map((x) => x.args.proposalId)
    let proposals = await this.fetchProposalBoard(contract, ids, currentBlock)

    for (const event of allLogs.created) {
      const { transactionHash, blockHash, blockNumber } = event
      const { proposalId, proposer, startBlock, endBlock, description, calldatas, signatures, targets } = event.args
      const descriptionHash = id(description)
      const headline = Helpers.getHeadline(description)

      proposals[proposalId.toString()] = {
        ...proposals[proposalId.toString()],
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

    for (const comment of allLogs.comments || []) {
      const { blockNumber, transactionHash } = comment
      const [ member, proposalId, timestamp, message ] = comment.args
      proposals[proposalId.toString()].comments.push({
        blockNumber, transactionHash,
        member: member.toChecksumAddress(),
        message, timestamp, proposalId,
      })
    }

    //prettier-ignore
    const proposalBlocks: T.ProposalBlockRelated[] = Object
      .values(proposals).map(x => {
        const { startBlock, proposalId } = x
        return { startBlock, proposalId }
    })

    //prettier-ignore
    const proposalQuorumBlocks = await new MultiCallApi()
      .fetchProposalBlockDependencies(contract, token, proposalBlocks)

    for (const { quorum, pastTotalSupply, proposalId } of proposalQuorumBlocks) {
      const p = proposals[proposalId.toString()]
      if (p.status === 0) continue
      if (!(p._forVotes instanceof BigNumber)) {
        p._forVotes = BigNumber.from(0)
      }

      if (!(p._againstVotes instanceof BigNumber)) {
        p._againstVotes = BigNumber.from(0)
      }

      if (quorum) {
        const forVotes = p._forVotes
        const againstVotes = p._againstVotes
        const quorumReached = forVotes.gt(quorum!)
        const _percentage = forVotes.gt(0) ? Helpers.calcQuorumState(quorum!, forVotes) : 0
        const percentage = Number(_percentage.toFixed(2))

        proposals[proposalId.toString()].quorum = quorum
        proposals[proposalId.toString()].quorumReached = quorumReached
        proposals[proposalId.toString()].percentage = percentage
      }

      if (pastTotalSupply) proposals[proposalId.toString()].pastTotalSupply = pastTotalSupply
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

    return proposals
  }
}