import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import * as helpers from '../helpers'
import logger from 'mocha-logger'

describe('Testing DaoToken Contract Functionality', async function () {
  let callData: string
  let proposalId: string

  const description = `Proposal #1 - mint 5 tokens to alice`
  const descriptionHash = ethers.utils.id(description)

  this.beforeEach(async () => await mine(2))

  it(`Deployments: Should Deploy Contracts`, async function () {
    if (this.governance && this.daoToken && this.alice) return
      ;[this.owner, this.alice, this.daoToken, this.timelock, this.governance] = await helpers.deployTestEnv()
    callData = this.daoToken.interface.encodeFunctionData('mint', [this.alice.address, '5000'])
  })

  it(`DaoToken Contract: Should Set Initial DaoToken Information`, async function () {
    const website = `https://kodexdata.systems`
    const manifest = `0x1a438a027592d7d6363be35c73876669aef167b8eedbdda249cb82de907be9c8` // note: random hash
    // due to testing we assign deployer address instead of timelock address!
    this.treasury = await ethers
      .getContractFactory('Treasury')
      .then((factory) => factory.deploy(this.owner.address))
      .then((contract) => contract.deployed())

    await Promise.all([
      this.daoToken.setWebsite(website).then((tx) => tx.wait()),
      this.daoToken.setTreasury(this.treasury.address).then((tx) => tx.wait()),
      this.daoToken.setManifest(manifest).then((tx) => tx.wait())
    ])

    expect(await this.daoToken.website()).equals(website)
    expect(await this.daoToken.treasury()).equals(this.treasury.address)
    expect(await this.daoToken.manifest()).equals(manifest)
  })

  it(`DaoToken Contract: Should Add Members to DAO`, async function () {
    for (const signer of (await ethers.getSigners()).slice(0, 5)) {
      const { events } = await this.daoToken.addMember(signer.address, 'dao developer').then((tx) => tx.wait())
      helpers.expectEvents(events, 'MemberAdded')
      expect(await this.daoToken.isMember(signer.address)).true
      logger.success(`DaoToken Contract: added dao member: ${signer.address}`)
    }
  })

  it(`DaoToken Contract: Should Query Total Member Count`, async function () {
    const totalMembers = await this.daoToken.totalMembers()
    expect(totalMembers).equals(5)
  })

  it(`DaoToken Contract: Should Not Add A Member Twice`, async function () {
    expect(() => this.daoToken.addMember(this.owner.address, 'dao developer')).to.be.revertedWith(`Member already registered`)
  })

  it(`DaoToken Contract: Should Payout Even All Members`, async function () {
    // fill treasury with 10 ether
    await this.owner.sendTransaction({ to: this.treasury.address, value: ethers.utils.parseUnits('10', 18) })
    const { events } = await this.treasury.withdrawEven(await this.daoToken.allMembers()).then((tx) => tx.wait())
    helpers.expectEvents(events, 'Withdrawn')
  })

  it(`DaoToken Contract: Alice Should Be Able To Leave DAO`, async function () {
    const { events } = await this.daoToken
      .connect(this.alice)
      .leaveDAO('payment is horrible')
      .then((tx) => tx.wait())
    helpers.expectEvents(events, 'MemberRemoved')
  })

  it(`DaoToken Contract: Should Query And Remove All Members`, async function () {
    for (const address of await this.daoToken.allMembers()) {
      const { events } = await this.daoToken.removeMember(address, 'arrested').then((tx) => tx.wait())
      helpers.expectEvents(events, 'MemberRemoved')
      logger.success(`DaoToken Contract: removed dao member: ${address}`)
    }
  })

  it(`DaoToken Contract: Should Delegate To Voter`, async function () {
    const tx = await this.daoToken.delegate(this.owner.address)
    const { events } = await tx.wait()
    helpers.expectEvents(events, 'DelegateChanged')
  })

  it(`DaoToken Contract: Accounts Without Votes Cannot Comment`, async function () {
    const [, bob] = await ethers.getSigners()
    await expect(this.daoToken.connect(bob).comment(`fails.`, 0)).to.be.revertedWith(
      'DaoComments: Not enough voting power to lea comments'
    )
  })

  it(`DaoToken Contract: DAO Members Should Be Able To Drop Comments`, async function () {
    const { events } = await this.daoToken.comment(`everyone should be able to emit comments`, 0).then((tx) => tx.wait())
    helpers.expectEvents(events, 'Comment')
  })

  it(`DaoToken Contract: Should Transfer Ownership Of DaoToken to TimeLock`, async function () {
    const { events } = await this.daoToken.transferOwnership(this.timelock.address).then((tx) => tx.wait(1))
    helpers.expectEvents(events, 'OwnershipTransferred')
    expect(await this.daoToken.owner()).equals(this.timelock.address)
  })

  it(`DaoToken Contract: Should Create A Proposal: ${description}`, async function () {
    const transaction = await this.governance.propose([this.daoToken.address], [0], [callData], description)
    const proposeReceipt = await transaction.wait(1)
    proposalId = helpers.expectEventArg(proposeReceipt, 'ProposalCreated', 'proposalId')
    expect(proposalId).string
  })

  it(`DaoToken Contract: Should Cast A Vote On Proposal`, async function () {
    const transaction = await this.governance.castVote(proposalId, 1)
    const { events } = await transaction.wait(1)
    helpers.expectEvents(events, 'VoteCast')
    expect(events!.find((x) => x.event === 'VoteCast')).not.null
  })

  it(`DaoToken Contract: Should Check Has Voted`, async function () {
    const voter = await this.governance.hasVoted(proposalId, this.owner.address)
    const noVoter = await this.governance.hasVoted(proposalId, this.alice.address)
    expect(voter).true
    expect(noVoter).false
  })

  it(`DaoToken Contract: Should Query Proposal Votes And State`, async function () {
    const state = await this.governance.state(proposalId)
    const deadline = await this.governance.proposalDeadline(proposalId)
    const { againstVotes, forVotes, abstainVotes } = await this.governance.proposalVotes(proposalId)

    expect(againstVotes).equals(0)
    expect(forVotes).greaterThan(0)
    expect(deadline).greaterThan(0)
    expect(abstainVotes).equals(0)
    expect(state).equals(1)
  })

  it(`DaoToken Contract: Should Queue The Proposal`, async function () {
    const deadline = await this.governance.proposalDeadline(proposalId)
    await mine(deadline.toNumber())
    const state = await this.governance.state(proposalId)
    expect(state).equals(4)

    const transaction = await this.governance.queue([this.daoToken.address], [0], [callData], descriptionHash)
    const { events } = await transaction.wait(1)
    helpers.expectEvents(events, 'ProposalQueued')
  })

  it(`DaoToken Contract: Should Execute The Proposal`, async function () {
    const transaction = await this.governance.execute([this.daoToken.address], [0], [callData], descriptionHash)
    const { events } = await transaction.wait(1)

    helpers.expectEvents(events, 'ProposalExecuted')
    expect(await this.daoToken.balanceOf(this.alice.address)).equals(5000)
    expect(await this.daoToken.getVotes(this.alice.address)).equals(0)
  })

  it(`DaoToken Contract: Alice Should Be Able To Delegate Her Tokens`, async function () {
    const tx = await this.daoToken.connect(this.alice).delegate(this.alice.address)
    const { events } = await tx.wait()
    const votes = await this.daoToken.getVotes(this.alice.address)

    expect(votes).equals(5000)
    helpers.expectEvents(events, 'DelegateChanged')
    logger.success(`DaoToken Contract: ALICE VOTES: ${votes}`)
  })
})
