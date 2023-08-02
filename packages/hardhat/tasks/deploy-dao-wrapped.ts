import type { DeployDaoWrappedResult, DeployDaoWrappedParams } from './types'
import { TASK_DEPLOY_DAO_WRAPPED } from './constants'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASK_DEPLOY_DAO_WRAPPED, 'deploys DAO Wrapped Token contract')
  .addParam('underlying', 'underlying ERC20 token')
  .addOptionalParam('name', 'the name of the token')
  .addOptionalParam('symbol', 'the symbol of the token')
  .addOptionalParam('owner', 'set owner of desired token - defaults to deployer')
  .setAction(async ({ name, symbol, owner, underlying, contract: contractAddress }: DeployDaoWrappedParams, { ethers }) => {
    const DaoWrapped = await ethers.getContractFactory('DaoWrapped')

    if (!underlying || !underlying.isAddress()) throw new Error('invalid address provided')
    if (contractAddress && contractAddress.isAddress()) {
      const instance = DaoWrapped.attach(contractAddress)
      const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
      const owner = await instance.owner()
      const name = await instance.name()
      const symbol = await instance.symbol()

      // prettier-ignore
      return {
        address: contractAddress,
        chainId, name, symbol, owner, instance,
      } as DeployDaoWrappedResult
    }

    if (!owner) {
      const [_owner] = await ethers.getSigners()
      owner = _owner.address
      logger.success(`owner`, owner)
    }

    
    const instance = await DaoWrapped.deploy(underlying,  owner, name, symbol).then((t) => t.deployed())
    const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
    const deployHash = instance.deployTransaction.hash
    const address = instance.address
    logger.success(
      `DaoWrapped: ${name} contract deployed to: ${address} - owner: ${owner} - chainId: ${chainId} - tx: ${deployHash}`
    )

    return { name, symbol, chainId, owner, address, deployHash, instance } as DeployDaoWrappedResult
  })
