import type * as T from './types'
import * as TASKS from './constants'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASKS.TASK_DEPLOY_ERC20, 'deploys ERC20 default main contract')
  .addOptionalParam('name', 'the name of the token')
  .addOptionalParam('symbol', 'the symbol of the token')
  .addOptionalParam('supply', 'the initial supply of tokens')
  .setAction(async ({ name, symbol, supply }: T.DeployERC20Params, { ethers }) => {
    if (!supply) supply = '100000'

    const AnyToken = await ethers.getContractFactory('AnyToken')
    const instance = await AnyToken.deploy(name, symbol, supply).then((t) => t.deployed())
    const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
    const deployHash = instance.deployTransaction.hash
    const address = instance.address

    logger.success(`ERC20: ${name} contract deployed to: ${address} - chainId: ${chainId} - tx: ${deployHash}`)

    return {
      instance,
      address,
      chainId,
      deployHash,
      name,
      symbol,
      supply
    } as T.DeployERC20Result
  })
