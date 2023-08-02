import { deployTestEnv } from '../helpers'
import { expectEvents, expectEventArg } from '@kodex-data/testing'
import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { BigNumber } from '@ethersproject/bignumber'
import { id } from '@ethersproject/hash'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { voteHelper } from '.'

describe('Testing Governance Contract Functionality', async function () {
  let callData: string
  let proposalId: string

  const description = `Proposal #2 - Add a SubDAO to DaoRegistry`
  const descriptionHash = id(description)

  this.beforeAll(function () {
    this.voteHelper = voteHelper.bind(this)
  })

  this.beforeEach(async () => {
    await mine(2)
  })

  it(`Deployments: Should deploy all contracts for testing environment`, async function () {
    if (this.governance && this.daoToken && this.alice) return
    if (!this.hacker) [, , , this.hacker] = await ethers.getSigners()
    ;[this.owner, this.alice, this.daoToken, this.timelock, this.governance, this.registry] = await deployTestEnv()
    callData = this.registry.interface.encodeFunctionData('activateDAO', [this.daoToken.address, 'fork cardano'])
  })

  it(`DaoToken Contract: Verifying Delegate Change Event Triggered Properly`, async function () {
    const tx = await this.daoToken.delegate(this.owner.address)
    const { events } = await tx.wait()
    expectEvents(events, 'DelegateChanged')
  })

  it(`DaoRegistry Contract: Verifying Successful Ownership to TimeLock Change Event`, async function () {
    const tx = await this.registry.transferOwnership(this.timelock.address)
    const { events } = await tx.wait(1)
    expectEvents(events, 'OwnershipTransferred')
    expect(await this.registry.owner()).equals(this.timelock.address)
  })

  it(`DaoToken Contract: Verifying Successful Ownership to TimeLock Change Event`, async function () {
    const tx = await this.daoToken.transferOwnership(this.timelock.address)
    const { events } = await tx.wait(1)
    expectEvents(events, 'OwnershipTransferred')
    expect(await this.daoToken.owner()).equals(this.timelock.address)
  })

  describe('Testing Voting Functionality', async function () {
    it(`Governance Contract: Verifying Successful Creation of Proposal with Specified Description and Arguments`, async function () {
      const transaction = await this.governance.propose([this.registry.address], [0], [callData], description)
      const proposeReceipt = await transaction.wait(1)
      proposalId = expectEventArg(proposeReceipt, 'ProposalCreated', 'proposalId')
      expect(proposalId).string
    })

    it(`Governance Contract: Verifying Successful Casting of Vote on a Proposal`, async function () {
      const transaction = await this.governance.castVote(proposalId, 1)
      const { events } = await transaction.wait(1)
      expectEvents(events, 'VoteCast')
    })

    it(`Governance Contract: Vote Should Pass But With Zero Weight`, async function () {
      const response = await this.governance.connect(this.hacker).castVote(proposalId, 1)
      const weight = expectEventArg<BigNumber>(await response.wait(), 'VoteCast', 'weight')
      expect(weight.toNumber()).equals(0)
    })

    it(`Governance Contract: Verifying Proper Detection of Voter Participation on a Proposal`, async function () {
      const voter = await this.governance.hasVoted(proposalId, this.owner.address)
      const noVoter = await this.governance.hasVoted(proposalId, this.alice.address)
      expect(voter).true
      expect(noVoter).false
    })

    it(`Governance Contract: Should Query Proposal Votes And State`, async function () {
      const state = await this.governance.state(proposalId)
      const deadline = await this.governance.proposalDeadline(proposalId)
      const { againstVotes, forVotes, abstainVotes } = await this.governance.proposalVotes(proposalId)

      expect(againstVotes).equals(0)
      expect(forVotes).greaterThan(0)
      expect(deadline).greaterThan(0)
      expect(abstainVotes).equals(0)
      expect(state).equals(1)
    })

    it(`Governance Contract: Should Queue The Succeeded Proposal`, async function () {
      const deadline = await this.governance.proposalDeadline(proposalId)
      await mine(deadline.toNumber())
      const state = await this.governance.state(proposalId)
      expect(state).equals(4)

      const transaction = await this.governance.queue([this.registry.address], [0], [callData], descriptionHash)
      const { events } = await transaction.wait(1)
      expectEvents(events, 'ProposalQueued')
    })

    it(`Governance Contract: Should Execute The Queued Proposal`, async function () {
      const transaction = await this.governance.execute([this.registry.address], [0], [callData], descriptionHash)
      const { events } = await transaction.wait(1)
      expectEvents(events, 'ProposalExecuted')
    })

    it(`Governance Contract: Verifying Proper Registration Of The New DAO`, async function () {
      const activeDAOs = await this.registry.totalDAOs()
      const isActive = await this.registry.isActiveDAO(this.daoToken.address)
      expect(activeDAOs).equals(1)
      expect(isActive).true
    })
  })

  context(`Scenario: Deploy New Governance With Existing Token`, async function () {
    it(`Deploying New Timelock Controller Contract`, async function () {
      this.timelock2 = await ethers
        .getContractFactory('TimelockController')
        .then((factory) =>
          factory
            .deploy(
              1,
              [this.owner.address, this.governance.address],
              [this.owner.address, this.governance.address],
              this.owner.address
            )
            .then((contract) => contract.deployed())
        )
    })

    it(`Should Revert The Timelock Update With Reason - "Governor: onlyGovernance"`, async function () {
      await expect(this.governance.updateTimelock(this.timelock2.address)).to.be.revertedWith('Governor: onlyGovernance')
    })

    it(`Should Transfer Token Ownership Through Governance`, async function () {
      const callData = this.daoToken.interface.encodeFunctionData('transferOwnership', [this.timelock2.address])
      const description = `# TRANSFER OWNERSHIP \n\n`

      const { executed } = await this.voteHelper({
        targets: [this.daoToken.address],
        values: [0],
        calldatas: [callData],
        description
      })

      expectEvents(executed, 'ProposalExecuted')
    })

    it(`Should Deploy A New Governance Contract`, async function () {
      this.governance = await ethers
        .getContractFactory('Governance')
        .then((factory) => factory.deploy(this.daoToken.address, this.timelock2.address, 256, 'Governance'))
        .then((contract) => contract.deployed())

      expect(await this.daoToken.owner()).equals(this.timelock2.address)
      expect(await this.governance.timelock()).equals(this.timelock2.address)

      // grant admin role
      const roles = [
        '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
        '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1'
      ]

      for (const role of roles) {
        await this.timelock2.grantRole(role, this.governance.address).then((tx) => tx.wait(1))
      }
    })

    it(`Should Create, Vote, Queue And Execute Proposal On The New Governance Contract`, async function () {
      const callData = this.daoToken.interface.encodeFunctionData('addMember', [this.hacker.address, 'new hacker dao member'])
      const description = `# ADD MEMBER \n\n`
      const descriptionId = id(description)
      const { events } = await this.governance
        .propose([this.daoToken.address], [0], [callData], description)
        .then((tx) => tx.wait())

      const proposalId = expectEventArg<BigNumber>(events, 'ProposalCreated', 'proposalId')

      await mine(2)

      expectEvents(await this.governance.castVote(proposalId, 1).then((tx) => tx.wait()), 'VoteCast')

      const state = await this.governance.state(proposalId)
      expect(state).equals(1)

      const deadline = await this.governance.proposalDeadline(proposalId)
      await mine(deadline.add(1).toNumber())
      // console.log(this.owner.address, this.timelock2.address, this.governance.address)
      expectEvents(
        await this.governance.queue([this.daoToken.address], [0], [callData], descriptionId).then((tx) => tx.wait()),
        'ProposalQueued'
      )
      expectEvents(
        await this.governance.execute([this.daoToken.address], [0], [callData], descriptionId).then((tx) => tx.wait()),
        'ProposalExecuted'
      )
    })
  })
})
