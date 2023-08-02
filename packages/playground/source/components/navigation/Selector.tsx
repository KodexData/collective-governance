import { useState } from 'react'
import { useApplication } from 'hooks'
import { useTranslation } from 'react-i18next'
import CachedIcon from '@mui/icons-material/Cached'
import DeleteIcon from '@mui/icons-material/HighlightOff'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SecurityIcon from '@mui/icons-material/Security'
import SaveIcon from '@mui/icons-material/Save'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'

const Selector: React.FC<{ label: string | React.ReactNode }> = (props) => {
  const { t } = useTranslation()
  const {
    navigate,
    context: { dispatch },
    governance
  } = useApplication()
  const [anchorEl, setAnchorEl] = useState<any>(null)
  const open = !!anchorEl

  function handleMenu(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title={'currentProfile.explorer'} placement='bottom'>
        <Button
          aria-label='Site settings'
          aria-controls='menu-site-settings'
          aria-haspopup='true'
          onClick={handleMenu}
          size='small'
        >
          {props.label}
        </Button>
      </Tooltip>
      <Menu
        id='menu-site-settings'
        // getContentAnchorEl={null}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        PaperProps={{
          style: {
            width: '400px',
            left: '-100px'
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        onClose={handleClose}
      >
        <MenuItem onClick={() => navigate('/contract')}>
          <ListItemText
            sx={{ marginLeft: '2em' }}
            onClick={handleClose}
            primary={
              <>
                <b>CONTRACT TOOL</b>
                <Typography component='div' variant='caption' noWrap>
                  Analyze, read and write smart contracts
                </Typography>
              </>
            }
          />
          <ListItemIcon>
            <SecurityIcon fontSize='large' />
          </ListItemIcon>
        </MenuItem>
        <MenuItem onClick={() => navigate('/dashboard')}>
          <ListItemText
            sx={{ marginLeft: '2em' }}
            onClick={handleClose}
            primary={
              <>
                <b>{t('Proposal Dashboard')}</b>
                <Typography component='div' variant='caption' noWrap>
                  {t('#proposal-dashboard-description')}
                </Typography>
              </>
            }
          />
          <ListItemIcon>
            <DashboardIcon fontSize='large' />
          </ListItemIcon>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => governance.refetch(0)}>
          <ListItemText
            sx={{ marginLeft: '2em' }}
            onClick={handleClose}
            primary={
              <>
                <b>{t('#refetch-data-tooltip')}</b>
                <Typography component='div' variant='caption' noWrap>
                  {t('#refetch-data-description')}
                </Typography>
              </>
            }
          />
          <ListItemIcon>
            <CachedIcon fontSize='large' />
          </ListItemIcon>
        </MenuItem>
        <MenuItem onClick={governance.resetCache}>
          <ListItemText
            sx={{ marginLeft: '2em' }}
            onClick={handleClose}
            primary={
              <>
                <b>{t('Reset Cache')}</b>
                <Typography component='div' variant='caption' noWrap>
                  {t('#reset-cache-description')}
                </Typography>
              </>
            }
          />
          <ListItemIcon>
            <DeleteIcon fontSize='large' />
          </ListItemIcon>
        </MenuItem>
        <MenuItem onClick={() => dispatch({ type: 'save-state' })}>
          <ListItemText
            sx={{ marginLeft: '2em' }}
            onClick={handleClose}
            primary={
              <>
                <b>{t('Save State')}</b>
                <Typography component='div' variant='caption' noWrap>
                  {t('#save-state-description')}
                </Typography>
              </>
            }
          />
          <ListItemIcon>
            <SaveIcon fontSize='large' />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  )
}

export default Selector
