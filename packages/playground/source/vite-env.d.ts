/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
import type { JsonFragment, FunctionFragment } from '@ethersproject/abi'
import { resources } from 'i18n/config'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: (typeof resources)['en']
  }
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '@collective-governance/api-evm/types' {
  export type TknInfo = {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    underlying?: string
    address?: string
    balance?: {
      address: string
      value: string
    }
  }
}

declare global {
  export interface RouteType {
    name: string
    path?: string
    icon?: React.FC | React.ReactElement
    link?: string
    target?: string
    cat?: string
    routes?: RouteType[]
    private?: Boolean
    redirect?: any
    Component: React.FC
    params?: any
    hide?: boolean
    description?: string
    hideSidebar?: boolean
  }

  export type Abis = JsonFragment | FunctionFragment | Record<string, any>
  export type AbiTypes = 'all' | 'function' | 'event' | 'error' | 'constructor' | 'receive'
}