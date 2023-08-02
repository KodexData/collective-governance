import { expectEvents } from '@kodex-data/testing'
import { getPermitSignature } from '@kodex-data/permit'
import { ethers } from 'hardhat'
import { expect } from 'chai'

describe('Testing DaoWrapped Contract Functionality', async function () {
  let amount = ethers.utils.parseUnits('1', 18)

  it(`Deployments: Should Deploy DaoWrapped Contracts`, async function () {
    if (this.daoWrapped && this.alice && this.bob) return
    ;[this.owner, this.alice, this.bob] = await ethers.getSigners()

    this.anyToken = await ethers
      .getContractFactory('AnyToken')
      .then((factory) => factory.deploy('AnyERC20PermitToken', 'PERMIT', 1000000))
      .then((contract) => contract.deployed())

    this.daoWrapped = await ethers
      .getContractFactory('DaoWrapped')
      .then((factory) => factory.deploy(this.anyToken.address, this.owner.address, 'AnyWrapped', 'ANY'))
      .then((contract) => contract.deployed())

    expect(this.daoWrapped).not.undefined
    expect(this.anyToken).not.undefined
  })

  it(`DaoWrapped Contract: Should Revert With "ERC20: insufficient allowance"`, async function () {
    await expect(this.daoWrapped.depositFor(this.owner.address, amount)).to.be.revertedWith(`ERC20: insufficient allowance`)
    await this.anyToken.approve(this.daoWrapped.address, amount).then((tx) => tx.wait())
  })

  it(`DaoWrapped Contract: Should Deposit For ${amount}`, async function () {
    const balance = await this.daoWrapped.balanceOf(this.owner.address)
    const { events } = await this.daoWrapped.depositFor(this.owner.address, amount).then((tx) => tx.wait())
    expectEvents(events, 'Approval', 'Transfer')
    expect(await this.daoWrapped.balanceOf(this.owner.address)).equals(amount)
    expect(balance).equals(0)
    expect(events).not.null
  })

  it(`DaoWrapped Contract: Should Delegate ${amount} To Voter`, async function () {
    const tx = await this.daoWrapped.delegate(this.owner.address)
    const { events } = await tx.wait()
    expectEvents(events, 'DelegateChanged')
  })

  it(`DaoWrapped Contract: Should Get ${amount} Votes`, async function () {
    const votes = await this.daoWrapped.getVotes(this.owner.address)
    expect(votes).equals(amount)
  })

  it(`DaoWrapped Contract: Should Withdraw To Bob`, async function () {
    const receipt = await this.daoWrapped.withdrawTo(this.bob.address, amount).then((tx) => tx.wait())
    expectEvents(receipt, 'DelegateVotesChanged', 'Transfer')
  })

  it(`DaoWrapped Contract: Bob Should Execute "depositForWithPermit"`, async function () {
    const deadline = ethers.constants.MaxUint256
    const sig = await getPermitSignature(this.bob, this.anyToken, this.daoWrapped.address, amount, deadline)
    //prettier-ignore
    const txResponse = await this.daoWrapped.connect(this.bob).depositForWithPermit(
      this.bob.address, amount, deadline, sig.v, sig.r, sig.s
    )
    const receipt = await txResponse.wait()
    expectEvents(receipt, 'Approval', 'Transfer')
  })
})
