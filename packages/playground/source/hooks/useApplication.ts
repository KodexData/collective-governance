import type { Theme } from '@mui/material'
import type { EthersContext } from '@kodex-react/ctx-ethers/types/types'
import type { StateContext } from 'context/state'
import type { GovernanceContext } from 'context/governance'
import type { NavigateFunction } from 'react-router-dom'
import type { ProviderContext } from 'notistack'
import { useForceUpdate } from '@kodex-react/ctx-ethers'
import { useContext } from 'react'
import { useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { CtxEthers, CtxState, CtxGovernance } from 'context'

type Application = {
  ethers: EthersContext
  context: StateContext
  governance: GovernanceContext
  navigate: NavigateFunction
  update: () => void
  snackbar: ProviderContext
  theme: Theme
}

/**
 * A custom hook that returns all the commonly used application-level hooks and context objects.
 * @date 26.4.2023 - 23:34:29
 *
 * @export
 * @returns {Application} An object containing commonly used hooks and context objects, including ethers, context, governance, navigate, update, snackbar, and theme.
 */
export default function useApplication(): Application {
  return {
    ethers: useContext(CtxEthers),
    context: useContext(CtxState),
    governance: useContext(CtxGovernance),
    navigate: useNavigate(),
    update: useForceUpdate(),
    snackbar: useSnackbar(),
    theme: useTheme()
  }
}
