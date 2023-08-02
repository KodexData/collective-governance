import { useApplication } from 'hooks'
import { animateScroll } from 'react-scroll'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '@mui/material'
import HideOnScroll from './HideOnScroll'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import SearchIcon from '@mui/icons-material/Search'
import shadows from '@mui/material/styles/shadows'
import IconButton from '@mui/material/IconButton'
import HomeIcon from '@mui/icons-material/Home'
import LoopIcon from '@mui/icons-material/Loop'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'

interface ScrollDownSideMenuProps {
  showUnder?: number
}

const ScrollDownSideMenu: React.FC<ScrollDownSideMenuProps> = () => {
  const { t } = useTranslation()
  const { theme, navigate, governance, context } = useApplication()
  const svgProps = { height: 32, width: 32 }
  const smallerThanSm = useMediaQuery(theme.breakpoints.down('sm'))

  const buttonSvg = {
    marginBottom: '2em',
    height: '45px',
    width: '45px',
    boxShadow: shadows[1],
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#fff',
    '&:hover': {
      background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
      boxShadow: shadows[2]
    },
    [theme.breakpoints.down('sm')]: {
      boxShadow: shadows[1],
      border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.background.default}` : `none`,
      '&:hover': {
        background: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
        boxShadow: shadows[3]
      }
    }
  }

  const handleHome = async () => {
    animateScroll.scrollToTop()
    navigate(`/`)
  }

  // eslint-disable-next-line
  const handleEditor = () => navigate(`/editor`)
  const handleSearchOpen = () =>
    context.dispatch({
      type: 'search/set-open',
      payload: true
    })

  const handleRefetch = async () => {
    await governance.refetch()
    animateScroll.scrollToTop()
  }

  //const placement = ['xs'].includes(width as string) ? 'top' : 'left'
  const placement = 'left'

  return (
    <HideOnScroll invert direction='up'>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '50px',
          position: 'fixed',
          right: '5px',
          bottom: '25px',
          zIndex: 1000,
          rowGap: 2,
          [theme.breakpoints.down('sm')]: {
            width: '95vw',
            justifyContent: 'space-between',
            right: 0,
            bottom: '10px',
            left: '10px',
            flexDirection: 'row',
            '& > *': {
              margin: '0.3em'
            }
          }
        }}
      >
        <Tooltip title={t('#home-icon-tooltip')} placement={placement}>
          <IconButton onClick={handleHome} style={buttonSvg} {...svgProps}>
            <Avatar>
              <HomeIcon />
            </Avatar>
          </IconButton>
        </Tooltip>
        <Tooltip title={t('#scroll-top-icon-tooltip')} placement={placement}>
          <IconButton onClick={() => {}} style={buttonSvg} {...svgProps}>
            <Avatar>
              <KeyboardDoubleArrowUpIcon />
            </Avatar>
          </IconButton>
        </Tooltip>
        <Tooltip title={t('#search-proposals-tooltip')} placement={placement}>
          <IconButton onClick={handleSearchOpen} style={buttonSvg} {...svgProps}>
            <Avatar>
              <SearchIcon />
            </Avatar>
          </IconButton>
        </Tooltip>
        <Tooltip title={t('#toggle-sidebar-tooltip')} placement={placement}>
          <IconButton
            onClick={() => context.dispatch({ type: 'set-hide-sidebar', payload: !context.state.hideSidebar })}
            style={buttonSvg}
            {...svgProps}
          >
            <Avatar>
              <AspectRatioIcon />
            </Avatar>
          </IconButton>
        </Tooltip>
        <Tooltip title={t('#refetch-data-tooltip')} placement={placement}>
          <IconButton onClick={handleRefetch} style={buttonSvg} {...svgProps}>
            <Avatar>
              <LoopIcon />
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
    </HideOnScroll>
  )
}

export default ScrollDownSideMenu
