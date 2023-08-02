import type * as T from './types'
import * as TASKS from './constants'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASKS.TASK_DEPLOY_TREASURY, 'deploys Collective DAO Treasury contract')
  .addOptionalParam('owner', 'set owner of DAO Treasury contract - default deployer address')
  .setAction(async ({ owner, nonce }: T.DeployTreasuryParams, { ethers }) => {
    const [deployer] = await ethers.getSigners()
    if (!owner || !owner.isAddress()) {
      owner = deployer.address
    }

    const TreasuryFactory = await ethers.getContractFactory('Treasury')
    const instance = await TreasuryFactory.deploy(owner, { nonce }).then((t) => t.deployed())
    const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
    const deployHash = instance.deployTransaction.hash
    const address = instance.address
    logger.success(`DAO Treasury contract deployed to: ${address} - chainId: ${chainId} - tx: ${deployHash}`)

    return {
      instance,
      chainId,
      deployHash,
      owner,
      address
    } as T.DeployTreasuryResult
  })
