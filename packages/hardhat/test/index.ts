import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import type { Event } from '@ethersproject/contracts'
import type {
  Governance,
  DaoToken,
  DaoWrapped,
  TimelockController,
  Treasury,
  DaoRegistry,
  AnyToken
} from '../typechain-types'
import { expectEvents, expectEventArg } from '@kodex-data/testing'
import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { id } from '@ethersproject/hash'

declare module 'mocha' {
  interface VoteHelper {
    targets: string[]
    values: number[]
    calldatas: string[]
    description: string
  }

  export interface Context {
    owner: SignerWithAddress
    hacker: SignerWithAddress
    alice: SignerWithAddress
    bob: SignerWithAddress

    governance: Governance
    governance2: Governance
    anyToken: AnyToken
    daoToken: DaoToken
    daoWrapped: DaoWrapped
    timelock: TimelockController
    timelock2: TimelockController
    treasury: Treasury
    registry: DaoRegistry
    daos: Map<string, DaoToken>
    voteHelper(
      this: Mocha.Context,
      options: VoteHelper
    ): Promise<{
      executed: Event[]
      proposalId: string
      descriptionId: string
    }>
  }
}

export * from '../typechain-types'

export async function voteHelper(this: Mocha.Context, options: Mocha.VoteHelper) {
  const descriptionId = id(options.description)
  const receipt = await this.governance
    .propose(options.targets, options.values, options.calldatas, options.description)
    .then((tx) => tx.wait())
  expectEvents(receipt, 'ProposalCreated')

  const proposalId = expectEventArg(receipt, 'ProposalCreated', 'proposalId')
  await mine(2)

  await this.governance.castVote(proposalId, 1).then((tx) => tx.wait())
  await this.governance
    .connect(this.alice)
    .castVote(proposalId, 1)
    .then((tx) => tx.wait())

  const deadline = await this.governance.proposalDeadline(proposalId)
  await mine(deadline.add(1))

  const queued = await this.governance
    .queue(options.targets, options.values, options.calldatas, descriptionId)
    .then((tx) => tx.wait())
  expectEvents(queued, 'ProposalQueued')

  await mine(2)

  const executed = await this.governance
    .execute(options.targets, options.values, options.calldatas, descriptionId)
    .then((tx) => tx.wait())

  return {
    executed: executed.events!,
    proposalId,
    descriptionId
  }
}
