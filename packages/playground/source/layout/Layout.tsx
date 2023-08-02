import * as Hooks from 'hooks'
import { useEffect, useMemo } from 'react'
import { isEmpty } from 'lodash'
import routes from 'routes'
import Footer from './Footer'
import Loader from './Loader'
import ConnectGovernance from './ConnectGovernance'
import Mainframe from './Mainframe'
import ScrollDownSideMenu from 'components/customs/ScrollDownSideMenu'
import NavigationBar from 'components/navigation/NavigationBar'
import EnableWallet from 'components/wallet/EnableWallet'
import NoWallet from 'components/wallet/NoWallet'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  //prettier-ignore
  const { context: { dispatch, state }, ethers } = Hooks.useApplication()
  const { id } = Hooks.useParams<{ id: string }>()
  const location = Hooks.useLocation()
  Hooks.useKeydownListener()

  const route = useMemo(() => {
    //prettier-ignore
    return routes.find(r =>
      r.path && location.pathname === r.path ||
      r.path !== '/' && location.pathname.includes(r.path!)
    )
  }, [location.pathname])

  useEffect(() => {
    dispatch({ type: 'set-hide-sidebar', payload: Boolean(route?.hideSidebar) })
  }, [route])

  const title = useMemo(() => {
    if (route) {
      const id = location.pathname.split('/proposal/')[1]
      if (route.name === 'PROPOSAL' && id && state.proposals[id]) {
        return state.proposals[id].headline
      }
      return route.name
    }

    return window.document.title
  }, [route, state, id, state.isInitialized])

  const hasProposals = useMemo(() => {
    return Object.keys(state.proposals).length > 0
  }, [state.proposalStateHash])

  const showConnector = useMemo(() => {
    // this happens on initial loading a blank contract.
    if (isEmpty(state.proposals) && state.proposalStateHash) return false
    return (!state.isLoading && !hasProposals) || (state.loggedOut && !hasProposals)
  }, [state.isLoading, hasProposals, state.loggedOut])

  const showLoader = useMemo(() => {
    if (!hasProposals && state.isLoading) return true
    return false
  }, [state.isLoading])

  const showWalletEnable = useMemo(() => {
    return ethers.state.noInjectedProvider || !ethers.state.isConnected || typeof ethers.state.chainId === 'undefined'
  }, [ethers.state.noInjectedProvider, ethers.state.chainId, ethers.state.isConnected])

  const element: React.ReactNode = useMemo(() => {
    if (location.pathname.includes('/link'))
      return (
        <Box textAlign='center' sx={{ mt: 4 }}>
          {children}
        </Box>
      )
    if (ethers.state.noInjectedProvider) return <NoWallet />
    if (showWalletEnable) return <EnableWallet />
    if (showConnector) return <ConnectGovernance chainId={ethers.state.chainId} />
    if (showLoader) return <Loader />

    return <Mainframe title={title}>{children}</Mainframe>
  }, [showWalletEnable, hasProposals, title, showConnector])

  return (
    <>
      <CssBaseline />
      <NavigationBar />
      <Box sx={{ mt: 8, mb: 4 }}>{element}</Box>
      <ScrollDownSideMenu />
      <Footer />
    </>
  )
}

export default Layout
