import type * as T from './types'
import * as TASKS from './constants'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASKS.TASK_DEPLOY_DAO_REGISTRY, 'deploys DaoRegistry main contract')
  .addOptionalParam('owner', 'specify owner of DaoRegistry - defaults to deployer')
  .setAction(async ({ owner }: T.DeployDaoRegistryParams, { ethers }) => {
    const DaoRegistryFactory = await ethers.getContractFactory('DaoRegistry')
    const instance = await DaoRegistryFactory.deploy().then((t) => t.deployed())
    const deployHash = instance.deployTransaction.hash
    const address = instance.address

    const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
    logger.success(`DaoRegistry contract deployed to: ${address} - chainId: ${chainId} - tx: ${deployHash}`)

    if (owner && owner.isAddress())
      try {
        const ownership1 = await instance.transferOwnership(owner).then((tx) => tx.wait(1))
        logger.success(
          `DaoRegistry: transfer ownership to: ${owner} - tx: ${ownership1.transactionHash}`,
          ownership1.events!.map((x) => x.event).join(', ')
        )
      } catch (error) {}

    return {
      instance,
      owner,
      address,
      chainId,
      deployHash
    } as T.DeployDaoRegistryResult
  })
