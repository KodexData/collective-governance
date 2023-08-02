import type * as T from './types'
import * as TASKS from './constants'
import { isERC20, printEvents } from './helpers'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASKS.TASK_DEPLOY_DAO, 'deploys governor contract for existing tokens')
  .addOptionalParam('controller', 'optional timelock address')
  .addOptionalParam('token', 'contract address to Existing Dao Token contract')
  .addOptionalParam('owner', 'set owner of dao token - defaults to deployer.')
  .addOptionalParam('underlying', 'if provided a dao-wrapped token will be deployed')
  .addOptionalParam('supply', 'set initial token supply - defaults to 100 tokens.')
  .addOptionalParam('name', 'name of your desired dao')
  .addOptionalParam('symbol', 'symbol of your desired dao')
  .addOptionalParam('purpose', 'purpose of your dao')
  .addOptionalParam('govname', 'name of the governance contract - defaults to Governance')
  .setAction(async (params: T.DeployGovernorParams, { ethers, run }) => {
    let { controller, name, symbol, purpose, owner, supply, token, underlying } = params
    let daoToken!: T.DeployDaoTokenResult | T.DeployDaoWrappedResult

    const [ownerSigner] = await ethers.getSigners()
    const network = await ethers.provider.getNetwork()
    const { CANCELLER_ROLE, EXECUTOR_ROLE, PROPOSER_ROLE, TIMELOCK_ADMIN_ROLE } = TASKS.ROLES
    logger.success(`network: ${network.name} - chainId: ${network.chainId}`)
    if (!params.govname) params.govname = 'Governance'
    if (!params.delay) params.delay = '1'
    if (!params.period) params.period = '360'
    if (!purpose) purpose = ''
    if (!supply) supply = '100'
    if (!owner || !owner.isAddress()) {
      owner = ownerSigner.address
      logger.success('USING DEPLOYER ADDRESS: ' + ownerSigner.address)
    }

    // prettier-ignore
    if (underlying && underlying.isAddress()) {
      const bytecode = await ethers.provider.getCode(underlying)
      if (!isERC20(bytecode)) {
        const error = new Error(`given underlying address is not a valid ERC20 contract`) as T.ERC20Error
        error['bytecode'] = bytecode
        error['address'] = underlying
        error['network'] = network

        throw error
      }

      daoToken = (await run(TASKS.TASK_DEPLOY_DAO_WRAPPED, {
        underlying, name, symbol, owner
      } as T.DeployDaoWrappedParams)) as T.DeployDaoWrappedResult
    } else {
      daoToken = (await run(TASKS.TASK_DEPLOY_DAO_TOKEN, {
        name, symbol, owner, supply, contract: token
      } as T.DeployDaoTokenParams)) as T.DeployDaoTokenResult
    }

    // prettier-ignore
    const { instance: timelock } = await run(TASKS.TASK_DEPLOY_TIMELOCK, {
      token: daoToken.address, owner, delay: params.delay, controller
    } as T.DeployTimelockParams) as T.DeployTimelockResult

    let nonce = await ownerSigner.getTransactionCount()

    function getNonce(i = 0) {
      // Nonce too high. Expected nonce to be 2 but got 3. Note that transactions can't be queued when automining.
      if (network.chainId === 31337) return
      return nonce + i
    }

    const [governance, treasury] = await Promise.all([
      ethers
        .getContractFactory('Governance')
        .then((f) =>
          f.deploy(daoToken.address, timelock.address, params.period!, params.govname!, { nonce: getNonce(0) }).then((tx) => tx.deployed())
        ),
      run(TASKS.TASK_DEPLOY_TREASURY, { owner: timelock.address, nonce: getNonce(1) }) as Promise<T.DeployTreasuryResult>
    ])

    logger.success(`Governance: ${governance.address} - tx: ${governance.deployTransaction.hash}`)
    logger.success(`Treasury: ${treasury.address} - tx: ${treasury.deployHash}`)

    nonce = await ownerSigner.getTransactionCount()

    const grants = await Promise.all([
      daoToken.instance.setTreasury(treasury.address, { nonce: getNonce(0) }).then((tx) => tx.wait(1)),
      timelock.grantRole(PROPOSER_ROLE, governance.address, { nonce: getNonce(1) }).then((tx) => tx.wait(1)),
      timelock.grantRole(EXECUTOR_ROLE, owner, { nonce: getNonce(2) }).then((tx) => tx.wait(1)),
      timelock.grantRole(TIMELOCK_ADMIN_ROLE, governance.address, { nonce: getNonce(3) }).then((tx) => tx.wait(1)),
      timelock.grantRole(CANCELLER_ROLE, owner, { nonce: getNonce(4) }).then((tx) => tx.wait(1))
    ])

    grants.map((receipt) => printEvents(receipt))
    nonce = await ownerSigner.getTransactionCount()

    const final = await Promise.all([
      timelock.revokeRole(TIMELOCK_ADMIN_ROLE, owner, { nonce: getNonce(0) }).then((tx) => tx.wait(1)),
      daoToken.instance.transferOwnership(timelock.address, { nonce: getNonce(1) }).then((tx) => tx.wait(1))
    ])

    final.map((receipt) => printEvents(receipt))
    logger.success(`process done`)
  })
