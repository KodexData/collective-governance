import type { State } from './types'

export default <State> {
  isInitialized: false,
  isLoading: false,
  editorOpen: false,
  errors: [],
  contracts: {},
  proposals: {},
  receipts: [],
  isAppReady: false
}