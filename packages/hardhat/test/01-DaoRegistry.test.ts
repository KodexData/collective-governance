import { expectEvents } from '@kodex-data/testing'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import logger from 'mocha-logger'

describe('Testing DaoRegistry Contract Functionality', async function () {
  this.beforeAll(async function () {
    if (this.registry) return
    if (!this.daos) this.daos = new Map()
    if (!this.owner) [this.owner] = await ethers.getSigners()

    const DaoTokenFactory = await ethers.getContractFactory('DaoToken')
    this.registry = await ethers
      .getContractFactory('DaoRegistry')
      .then((factory) => factory.deploy())
      .then((contract) => contract.deployed())

    for (let i = 0; i < 10; i++) {
      const contract = await DaoTokenFactory.deploy(`DaoToken-${i}`, `SD${i}`, this.owner.address, 100)
      this.daos.set(contract.address, contract)
      logger.success(`DaoRegistry Contract: Deployed DaoToken ${contract.address}`)
    }
  })

  it(`DaoRegistry Contract: Activating 10 DAOs`, async function () {
    for (const dao of this.daos.values()) {
      const tx = await this.registry.activateDAO(dao.address, 'test purpose')
      const { events } = await tx.wait()
      expectEvents(events, 'ActivatedDAO')
    }
  })

  it(`DaoRegistry Contract: Should Get All DAO Addresses`, async function () {
    const addresses = await this.registry.allDAOs()
    expect(addresses.length).equals(10)
  })

  it(`DaoRegistry Contract: Verifying All DAOs Have Been Activated`, async function () {
    for (const dao of this.daos.values()) {
      const isActive = await this.registry.isActiveDAO(dao.address)
      expect(isActive).true
    }
  })

  it(`DaoRegistry Contract: Verifying DAO Count To 10`, async function () {
    const daoCount = await this.registry.totalDAOs()
    expect(daoCount).equals(10)
  })

  it(`DaoRegistry Contract: Deactivate A Single DAO`, async function () {
    const addresses = await this.registry.allDAOs()
    const tx = await this.registry.deactivateDAO(addresses[3], 'decommission working group')
    const { events } = await tx.wait()

    expectEvents(events, 'DeactivatedDAO')
    expect(await this.registry.isActiveDAO(addresses[3])).eq(false)
    expect(await this.registry.totalDAOs()).eq(9)

    logger.success(`DaoRegistry Contract: Deactivated DaoToken ${addresses[3]}`)
    this.daos.delete(addresses[3])
  })

  it(`DaoRegistry Contract: Deactivating All DAOs`, async function () {
    for (const dao of this.daos.values()) {
      const tx = await this.registry.deactivateDAO(dao.address, 'project finished')
      const { events } = await tx.wait()
      expectEvents(events, 'DeactivatedDAO')

      const isActive = await this.registry.isActiveDAO(dao.address)
      expect(isActive).false

      const addresses = await this.registry.allDAOs()
      expect(addresses).not.includes(dao.address)

      logger.success(`DaoRegistry Contract: Deactivated DaoToken ${dao.address}`)
    }
  })

  it(`DaoRegistry Contract: Verifying Total DAOs Equals Zero`, async function () {
    const daoCount = await this.registry.totalDAOs()
    expect(daoCount).equals(0)
  })
})
