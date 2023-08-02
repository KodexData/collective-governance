import type { State } from './types'
import { BigNumber } from '@ethersproject/bignumber'

const STORAGE_VERSION = 'v3'
export function generateKey(chainId: number | BigNumber | string, governanceAddress: string) {
  return `dc-${STORAGE_VERSION}_${chainId}_${governanceAddress.toChecksumAddress()}`
}

export function loadCachedState(chainId: number | BigNumber, governorAddress: string): State | undefined {
  const storage = localStorage.getItem(generateKey(chainId, governorAddress))
  if (storage) try {
    const data = JSON.parse(storage)
    return data
  } catch (error) {
    const key = generateKey(chainId, governorAddress)
    console.error(`error loading state from localStorage`, key)
  }
}

export function saveCachedState(state: State): boolean {
  if (!state.chainId || !state.contracts.Governance) return false
  const key = generateKey(state.chainId, state.contracts.Governance.toChecksumAddress())
  localStorage.setItem(key, JSON.stringify({ ...state, receipts: [], errors: [] }))
  console.debug(`saving state to local storage - key: ${key}`)
  return true
}