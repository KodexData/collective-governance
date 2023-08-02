import { animateScroll } from 'react-scroll'
import { useEffect, useMemo } from 'react'
import { useApplication, useTheme } from 'hooks'
import { useTranslation } from 'react-i18next'
import WalletMenu from './WalletMenu'
import EditorMenu from './EditorMenu'
import Selector from './Selector'
import LangMenu from './LangMenu'
import SearchModal from 'components/search/SearchModal'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import CircularProgress from '@mui/material/CircularProgress'
import GitHubIcon from '@mui/icons-material/GitHub'
import SearchIcon from '@mui/icons-material/Search'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import Paper from '@mui/material/Paper'
import Badge from '@mui/material/Badge'
import Home from '@mui/icons-material/Home'
import Box from '@mui/material/Box'

const NavigationBar: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const {
    ethers,
    context: { state, getActiveProposals, dispatch },
    navigate,
    update
  } = useApplication()

  const hasActiveProposals = useMemo(() => {
    return getActiveProposals().length > 0
  }, [state.proposalStateHash, ethers.state.blockNumber])

  const handleNavigate = (to: string) => {
    navigate(to)
    animateScroll.scrollToTop()
  }

  useEffect(() => {
    update()
    //eslint-disable-next-line
  }, [ethers.state.address])

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='fixed' color='inherit' component={Paper}>
        <Toolbar variant='dense'>
          <Tooltip title={t('#home-icon-tooltip')} placement='bottom-start'>
            <IconButton onClick={() => handleNavigate('/')}>
              <Home />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('#refetch-data-tooltip')} placement='bottom-end'>
            <IconButton sx={{ mr: 1 }} href='https://github.com/KodexData' target='_blank'>
              <GitHubIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Selector
            label={
              <Typography
                sx={{
                  fontWeight: 200
                }}
                color='green'
                noWrap
              >
                <span style={{ color: theme.palette.warning.main }}>COLLECTIVE</span> GOVERNANCE
              </Typography>
            }
          />
          <Box style={{ flexGrow: 1 }} />
          {state.isLoading && (
            <Tooltip title={t('#refetch-data-tooltip')} placement='bottom-end'>
              <IconButton sx={{ mr: 1 }}>
                <CircularProgress size={18} variant='indeterminate' />
              </IconButton>
            </Tooltip>
          )}
          <LangMenu />
          {hasActiveProposals && (
            <Tooltip title={t('Show Active Proposals')} placement='bottom-end'>
              <IconButton onClick={() => handleNavigate('/active')} sx={{ mr: 1 }}>
                <Badge badgeContent={getActiveProposals().length} color='success'>
                  <NotificationsActiveIcon fontSize='small' />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          <EditorMenu />
          {state.isInitialized && (
            <SearchModal
              open={Boolean(state.searchOpen)}
              handleClose={() => dispatch({ type: 'search/set-open', payload: false })}
            >
              <Tooltip title={t('#search-proposals-tooltip')} placement='bottom-end'>
                <IconButton onClick={() => dispatch({ type: 'search/set-open', payload: true })}>
                  <SearchIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </SearchModal>
          )}
          <WalletMenu />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default NavigationBar
