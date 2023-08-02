import { SnackbarProvider } from 'notistack'
import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material'
import { theme } from 'utils/theme'
import { Layout } from 'layout'
import { useConfig } from 'config'
import EthersContext from '@kodex-react/ctx-ethers'
import StateProvider from 'context/state'
import GovernanceProvider from 'context/governance'
import NewProposalProvider from 'context/proposal'
import routes from './routes'
import 'i18n/config'

const App: React.FC = () => {
  const { isDev } = useConfig()
  return (
    <>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <StateProvider>
            <EthersContext autoEnable>
              <GovernanceProvider DEBUG={isDev}>
                <NewProposalProvider>
                  <Layout>
                    <Routes>
                      {routes.map(({ path, params, Component }: RouteType) => {
                        if (!params) return <Route key={path} path={path} element={<Component />} />
                        return (
                          <Route key={path} path={path} element={<Component />}>
                            <Route path={params} element={<Component />} />
                          </Route>
                        )
                      })}
                    </Routes>
                  </Layout>
                </NewProposalProvider>
              </GovernanceProvider>
            </EthersContext>
          </StateProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </>
  )
}

export default App
