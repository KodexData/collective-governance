import { CtxEthers, CtxState } from 'context'
import { useTheme } from 'hooks'
import React, { useContext, useMemo } from 'react'
import GovernanceInfo from 'components/sidebar/GovernanceInfo'
import ProposalSidebars from 'components/sidebar/ProposalSidebars'
import GovernanceErrors from './GovernanceErrors'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'

interface MainframeProps {
  children: React.ReactNode
  title: string
}

const withSidebar = {
  main: {
    xs: 12,
    sm: 12,
    md: 8,
    lg: 8,
    xl: 8
  },
  side: {
    xs: 12,
    sm: 12,
    md: 4,
    lg: 4,
    xl: 4
  }
}

const withoutSidebar = {
  main: {
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 12
  },
  side: {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0
  }
}

const Mainframe: React.FC<MainframeProps> = (props) => {
  const theme = useTheme()
  const { state } = useContext(CtxState)
  const ethers = useContext(CtxEthers)

  const { main, side } = useMemo(() => {
    return state.hideSidebar ? withoutSidebar : withSidebar
  }, [state.hideSidebar])

  return (
    <>
      <Container
        sx={{
          textAlign: 'center',
          paddingTop: theme.spacing(2),
          height: '95%'
        }}
        maxWidth='xl'
      >
        <Typography variant='h2' gutterBottom sx={{ mb: 4 }}>
          {props.title}
          <Divider />
          <Typography variant='caption'>
            CHAINID: {ethers.state.chainId} | BLOCK: {ethers.state.blockNumber}
            {ethers.state.blockTime && ethers.state.blockTime > 0 && <> | BLOCK TIME: {ethers.state.blockTime} seconds</>}
          </Typography>
        </Typography>
        <Grid container spacing={2}>
          <Fade in={true} timeout={333}>
            <Grid item {...main}>
              {props.children}
            </Grid>
          </Fade>
          {!state.hideSidebar && (
            <Fade in={!state.hideSidebar} timeout={666}>
              <Grid item {...side}>
                <GovernanceErrors />
                <GovernanceInfo />
                <ProposalSidebars />
              </Grid>
            </Fade>
          )}
        </Grid>
      </Container>
    </>
  )
}

export default Mainframe
