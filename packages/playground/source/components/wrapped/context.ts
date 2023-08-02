import type { DaoWrapped, TknInfo } from '@collective-governance/api-evm/types'
import { createContext } from 'react'

export interface WrappedTokenState {
  contract: DaoWrapped
  getData(): Promise<Partial<WrappedTokenState> | undefined>
  balance1: string
  balance2: string
  info1: TknInfo
  info2: TknInfo
}

export const CtxWrapped = createContext({} as Partial<WrappedTokenState>)
