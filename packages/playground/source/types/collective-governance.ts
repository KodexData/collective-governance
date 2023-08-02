import type { ERC20 } from '@collective-governance/hardhat'
export * from '@collective-governance/api-evm/types'
export type { ERC20 } from '@collective-governance/hardhat'
export type DeployedResult<Tkn = ERC20> = {
  address: string
  token: Tkn
  deployTx: string
  blockNumber: number | undefined
}
