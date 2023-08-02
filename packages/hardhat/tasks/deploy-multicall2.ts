import type * as T from './types'
import * as TASKS from './constants'
import { Multicall2__factory } from '@kodex-data/multicall'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASKS.TASK_DEPLOY_MULTICALL2, 'deploys Multicall helper contract').setAction(async ({}, { ethers }) => {
  const [deployer] = await ethers.getSigners()
  const Multicall2Factory = new Multicall2__factory(deployer)
  const instance = await Multicall2Factory.deploy().then((t) => t.deployed())
  const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
  const deployHash = instance.deployTransaction.hash
  const address = instance.address

  logger.success(
    `Multicall2: contract deployed to: ${instance.address} - chainId: ${chainId} - tx: ${instance.deployTransaction.hash}`
  )

  return {
    instance,
    address,
    chainId,
    deployHash
  } as T.DeployMulticall2Result
})
