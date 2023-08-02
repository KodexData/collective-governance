import type { Multicall2 } from '@kodex-data/multicall'
import type * as T from '../typechain-types'
import type { Network } from '@ethersproject/providers'
import type { HardhatEthersHelpers } from 'hardhat/types'
import type { ethers } from 'ethers'

export type Ethers = typeof ethers & HardhatEthersHelpers

export interface UserRole {
  role: string
  sender: string
  account: string
  hash: string
  blockNumber: number
  roleName?: string
}

export interface ListOwnershipParams {
  address: string
  output?: string
}

export interface ListOwnershipResult {
  token: {
    address: string
    owner: string
  }
  governance: {
    address: any
    timelock: string
    tokenAddress: string
  }
  timelock: {
    address: string
    granted: UserRole[]
    revoked: UserRole[]
    users: Record<string, string[]>
  }
  roles: Record<string, string>
}

export interface ERC20Error extends Error {
  bytecode: string
  address: string
  network: Network
}

export interface DeployDaoTokenParams {
  // if contract is provided, the instance will be queried
  contract?: string
  name: string
  symbol: string
  supply?: string
  owner?: string
  purpose?: string
}

export interface DeployDaoTokenResult extends DeployDaoTokenParams {
  instance: T.DaoToken
  chainId: number
  address: string
  deployHash?: string
}

export interface DeployDaoWrappedParams {
  // if contract is provided, the instance will be queried
  contract?: string
  underlying: string
  name: string
  symbol: string
  owner?: string
  purpose?: string
}

export interface DeployDaoWrappedResult extends DeployDaoWrappedParams {
  instance: T.DaoWrapped
  chainId: number
  address: string
  deployHash?: string
}

export interface DeployGovernorParams extends Partial<DeployDaoTokenParams> {
  // timelock address optional
  controller?: string
  // erc20 address to wrap
  underlying?: string
  owner: string
  token: string
  period?: string
  delay?: string
  govname?: string
}

export interface DeployTreasuryParams {
  // timelock address
  owner: string
  nonce?: number
}

export interface DeployTreasuryResult extends DeployTreasuryParams {
  instance: T.Treasury
  chainId: number
  address: string
  deployHash: string
}

export interface DeployERC20Params {
  name: string
  symbol: string
  supply?: string
}

export interface DeployERC20Result extends DeployERC20Params {
  instance: T.AnyToken
  chainId: number
  address: string
  deployHash: string
}

export interface DeployDaoRegistryParams {
  // will transfer ownership to given timelock address
  owner?: string
}

export interface DeployDaoRegistryResult extends DeployDaoRegistryParams {
  instance: T.DaoRegistry
  chainId: number
  address: string
  deployHash: string
}

export interface DeployMulticall2Result {
  instance: Multicall2
  chainId: number
  address: string
  deployHash: string
}

export interface DeployTimelockParams {
  controller?: string
  // will transfer ownership to given timelock address
  owner?: string
  token: string
  delay?: string
}

export interface DeployTimelockResult extends Omit<DeployTimelockParams, 'controller'> {
  instance: T.TimelockController
  chainId: number
  address: string
  deployHash: string
}
