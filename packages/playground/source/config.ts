import { MultiCall } from '@kodex-data/multicall'
import { useMemo } from 'react'

let isInitialized = false
export const VERSION = `v0.0.1`
export const CHAIN_ID = 4669
export const MULTICALL_ADDRESS = '0xAb85F66f2f512E3576a31e810ff30451Cc4e2e7b'

export const multicallContracts: MulticallContract[] = [{ chainId: CHAIN_ID, address: MULTICALL_ADDRESS }]

export type MulticallContract = { chainId: number; address: string }

export const defaultContracts = {
  '200101': {
    DaoToken: '0x257AdB73cd859CcB85AB9EFdFcAED5b701FbBdfd',
    Governance: '0xD7ecE5875BB844bA5b36e13C6587cD88E2a06B65',
    TimelockController: '0x0823baA231EEc6275540BD8d43ce00BDd39e3e01',
    Treasury: '0x480fe07768a988AfAb1FBD04E3E51f85260b546E'
  },
  '78': {
    DaoToken: '0xAb85F66f2f512E3576a31e810ff30451Cc4e2e7b',
    Treasury: '0x7FBCf71492e8f862F80e2aB682DA7584cd5ba452',
    TimelockController: '0x89CE02A4646961E4CC4542775B47F9818687fCfe',
    Governance: '0x6e716AfaAFC10Ce5e93C12834b73D7Cc185a79ab'
  }
} as const

export type DcContracts = typeof defaultContracts
export type ChainsIds = keyof typeof defaultContracts
export type ContractList = (typeof defaultContracts)[ChainsIds]

export function initialize(contracts: MulticallContract[] = []) {
  if (!isInitialized) {
    multicallContracts.concat(contracts).forEach((c) => MultiCall.Contracts.set(c.chainId, c.address))
    isInitialized = true
  }

  return process.env.NODE_ENV === 'development'
}

export function useConfig() {
  const isDev = useMemo(() => initialize(), [])
  return {
    VERSION,
    CHAIN_ID,
    MULTICALL_ADDRESS,
    defaultContracts,
    multicallContracts,
    initialize,
    isDev
  }
}
