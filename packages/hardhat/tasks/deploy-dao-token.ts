import type { DeployDaoTokenResult, DeployDaoTokenParams } from './types'
import { TASK_DEPLOY_DAO_TOKEN } from './constants'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'

task(TASK_DEPLOY_DAO_TOKEN, 'deploys DAO Token contract')
  .addOptionalParam('name', 'the name of the token')
  .addOptionalParam('symbol', 'the symbol of the token')
  .addOptionalParam('supply', 'the initial supply of tokens - default: 100.000 tokens')
  .addOptionalParam('owner', 'set owner of desired token - defaults to deployer')
  .setAction(
    async ({ name, symbol, supply: initialSupply, owner, contract: contractAddress }: DeployDaoTokenParams, { ethers }) => {
      const DaoToken = await ethers.getContractFactory('DaoToken')

      if (contractAddress && contractAddress.isAddress()) {
        const instance = DaoToken.attach(contractAddress)
        const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
        const owner = await instance.owner()
        const name = await instance.name()
        const symbol = await instance.symbol()
        const totalSupply = await instance.totalSupply()
        // prettier-ignore
        return {
          address: contractAddress,
          chainId, name, symbol, owner, instance,
          supply: totalSupply.shiftedBy(-18),
        } as DeployDaoTokenResult
      }

      if (!initialSupply) initialSupply = '100000'
      if (!owner) {
        const [_owner] = await ethers.getSigners()
        owner = _owner.address
        logger.success(`owner`, owner)
      }

      const instance = await DaoToken.deploy(name, symbol, owner, initialSupply || '100000').then((t) => t.deployed())
      const chainId = await instance.provider.getNetwork().then((n) => n.chainId)
      const deployHash = instance.deployTransaction.hash
      const address = instance.address
      logger.success(
        `DaoToken: ${name} contract deployed to: ${address} - owner: ${owner} - chainId: ${chainId} - tx: ${deployHash}`
      )

      return { name, symbol, supply: initialSupply, chainId, owner, address, deployHash, instance } as DeployDaoTokenResult
    }
  )
