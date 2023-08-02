import { ethers } from 'hardhat'
import { DEPLOY_DEFAULTS } from './constants'
import { Treasury__factory } from '../typechain-types'
import { ADDRESS_ZERO } from '@kodex-data/testing'

type Addresses = Partial<{
  [index: string]: string
  deployer: string
  daoRegistry: string
  daoToken: string
  governance: string
  timelockController: string
  daoTreasury: string
  multiCall2: string
}>

export async function deployInitial(options: Partial<typeof DEPLOY_DEFAULTS> = {}) {
  if (!options.tokenName) options.tokenName = DEPLOY_DEFAULTS.tokenName
  if (!options.tokenSymbol) options.tokenSymbol = DEPLOY_DEFAULTS.tokenSymbol
  if (!options.preMint) options.preMint = DEPLOY_DEFAULTS.preMint
  if (!options.votingPeriod) options.votingPeriod = DEPLOY_DEFAULTS.votingPeriod
  if (!options.minDelay) options.minDelay = DEPLOY_DEFAULTS.minDelay

  const addresses: Addresses = {}
  const [owner] = await ethers.getSigners()
  addresses.deployer = owner.address

  const TimelockControllerFactory = await ethers.getContractFactory('TimelockController')
  const GovernanceFactory = await ethers.getContractFactory('Governance')
  const DaoTokenFactory = await ethers.getContractFactory('DaoToken')
  const DaoRegistryFactory = await ethers.getContractFactory('DaoRegistry')
  const TreasuryFactory = new Treasury__factory(owner)

  const contract = await DaoRegistryFactory.deploy()
  const daoToken = await DaoTokenFactory.deploy(options.tokenName, options.tokenSymbol, owner.address, 100)

  addresses.daoRegistry = contract.address
  addresses.daoToken = daoToken.address

  // prettier-ignore
  await Promise.all([contract.deployed(), daoToken.deployed()])
  if (options.preMint) await daoToken.mint(owner.address, options.preMint).then((tx) => tx.wait(1))

  const timelock = await TimelockControllerFactory.deploy(
    options.minDelay,
    [daoToken.address, contract.address],
    [ADDRESS_ZERO],
    owner.address
  )

  addresses.timelockController = timelock.address

  const treasury = await TreasuryFactory.deploy(addresses.timelockController)
  const governance = await GovernanceFactory.deploy(
    addresses.daoToken,
    addresses.timelockController,
    options.votingPeriod,
    'Governance'
  )

  addresses.governance = governance.address
  addresses.daoTreasury = treasury.address

  // prettier-ignore
  await Promise.all([
    timelock.deployed(), governance.deployed(), treasury.deployed(),
    timelock.grantRole(await timelock.PROPOSER_ROLE(), addresses.governance).then((tx) => tx.wait(1)),
    timelock.grantRole(await timelock.EXECUTOR_ROLE(), addresses.deployer).then((tx) => tx.wait(1)),
    timelock.grantRole(await timelock.TIMELOCK_ADMIN_ROLE(), addresses.governance).then((tx) => tx.wait(1)),
    timelock.revokeRole(await timelock.TIMELOCK_ADMIN_ROLE(), addresses.deployer),
    daoToken.transferOwnership(addresses.timelockController).then((tx) => tx.wait(1)),
    contract.transferOwnership(addresses.timelockController).then((tx) => tx.wait(1))
  ])

  console.log(`Treasury: ${addresses.daoTreasury}`)
  console.log(`Governance: ${addresses.governance}`)
  console.log(`Timelock: ${addresses.timelockController}`)
  console.log(`DaoRegistry: ${addresses.daoRegistry}`)
  console.log(`DaoToken: ${addresses.daoToken}`)
}

export async function deployTestEnv() {
  const addresses: Addresses = {}
  const [owner, alice] = await ethers.getSigners()
  addresses.deployer = owner.address

  const TimelockControllerFactory = await ethers.getContractFactory('TimelockController')
  const GovernanceFactory = await ethers.getContractFactory('Governance')
  const DaoTokenFactory = await ethers.getContractFactory('DaoToken')
  const DaoRegistryFactory = await ethers.getContractFactory('DaoRegistry')
  const TreasuryFactory = new Treasury__factory(owner)

  const contract = await DaoRegistryFactory.deploy()
  const daoToken = await DaoTokenFactory.deploy(DEPLOY_DEFAULTS.tokenName, DEPLOY_DEFAULTS.tokenSymbol, addresses.deployer, 100)

  addresses.daoRegistry = contract.address
  addresses.daoToken = daoToken.address

  // prettier-ignore
  await Promise.all([
    contract.deployed(), daoToken.deployed(),
    daoToken.mint(addresses.deployer, DEPLOY_DEFAULTS.preMint).then((tx) => tx.wait(1))
  ])

  const timelock = await TimelockControllerFactory.deploy(
    0,
    [addresses.daoToken, addresses.daoRegistry],
    [ADDRESS_ZERO],
    addresses.deployer
  )
  addresses.timelockController = timelock.address

  const treasury = await TreasuryFactory.deploy(timelock.address)
  const governance = await GovernanceFactory.deploy(addresses.daoToken, addresses.timelockController, 100, 'Governance')

  addresses.governance = governance.address
  addresses.daoTreasury = treasury.address

  // prettier-ignore
  await Promise.all([
    timelock.deployed(), governance.deployed(), treasury.deployed(),
    timelock.grantRole(await timelock.PROPOSER_ROLE(), addresses.governance).then((tx) => tx.wait(1)),
    timelock.grantRole(await timelock.EXECUTOR_ROLE(), addresses.deployer).then((tx) => tx.wait(1)),
    timelock.grantRole(await timelock.TIMELOCK_ADMIN_ROLE(), addresses.governance).then((tx) => tx.wait(1)),
    timelock.revokeRole(await timelock.TIMELOCK_ADMIN_ROLE(), addresses.deployer)
  ])

  return [owner, alice, daoToken, timelock, governance, contract, treasury] as const
}
