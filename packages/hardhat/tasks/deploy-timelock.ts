import type * as T from './types'
import * as TASKS from './constants'
import { isTimelock, ADDRESS_ZERO } from './helpers'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASKS.TASK_DEPLOY_TIMELOCK, 'deploys Timelock Controller contract')
  .addOptionalParam('controller', 'specify contract address')
  .addOptionalParam('delay', 'specify minimum voting delay - defaults to 1')
  .addOptionalParam('token', 'specify owner of Timelock - defaults to deployer')
  .addOptionalParam('owner', 'owner for timelock controller - defaults to deployer')
  .setAction(async ({ owner, token, delay, controller }: T.DeployTimelockParams, { ethers }) => {
    if (!delay) delay = '1'
    if (!owner) {
      const [_owner] = await ethers.getSigners()
      owner = _owner.address
    }

    const Factory = await ethers.getContractFactory('TimelockController')
    if (controller && controller.isAddress()) {
      if (!isTimelock(await ethers.provider.getCode(controller))) {
        throw new Error(`given timelock address is not a valid timelock contract.`)
      }

      const instance = Factory.attach(controller)
      const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
      const isAdmin = await instance.hasRole(TASKS.ROLES.TIMELOCK_ADMIN_ROLE, owner)

      if (!isAdmin) {
        logger.log(`your given address has not the timelock admin role.`)
      }

      const isExecutor = await instance.hasRole(TASKS.ROLES.EXECUTOR_ROLE, owner)
      if (!isExecutor) {
        logger.log(`your given address has no executor role.`)
      }

      const delay = await instance.getMinDelay().then((b) => b.toString())

      logger.success(`Timelock: ${controller} - loaded existing - minDelay: ${delay}`)

      return {
        instance,
        token,
        chainId,
        address: controller,
        owner: isAdmin ? owner : undefined,
        delay
      } as T.DeployTimelockResult
    }

    const instance = await Factory.deploy(delay, [token], [ADDRESS_ZERO], owner).then((tx) => tx.deployed())
    const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
    const deployHash = instance.deployTransaction.hash
    const address = instance.address

    logger.success(`Timelock: ${address} - tx: ${deployHash}`)

    return {
      instance,
      token,
      chainId,
      deployHash,
      address,
      owner,
      delay
    } as T.DeployTimelockResult
  })
