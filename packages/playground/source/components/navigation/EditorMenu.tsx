import { useNavigate } from 'react-router-dom'
import { animateScroll } from 'react-scroll'
import { useState } from 'react'
import { useOperatorStatus } from 'hooks'
import { useTranslation } from 'react-i18next'
import StyledMenu from 'components/customs/StyledMenu'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'

import SavingsIcon from '@mui/icons-material/Savings'

const EditorMenu: React.FC = () => {
  const { t } = useTranslation()
  const ops = useOperatorStatus()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigate = (to: string) => {
    navigate(to)
    animateScroll.scrollToTop()
    setAnchorEl(null)
  }

  if (!(ops.isProposer || ops.canPropose)) return <></>

  return (
    <div>
      <Tooltip title={t('Create New Proposal')} placement='bottom-end'>
        <IconButton
          id='select-editor-button'
          aria-controls={open ? 'select-editor-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{ mr: 1 }}
        >
          <AddCircleIcon fontSize='small' />
        </IconButton>
      </Tooltip>
      <StyledMenu
        id='select-editor-menu'
        MenuListProps={{
          'aria-labelledby': 'select-editor-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleNavigate('/editor')} disableRipple>
          <EditIcon />
          {t('Create New Proposal')}
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/token-wizard')} disableRipple>
          <SavingsIcon />
          {t('Token Minting Wizard')}
        </MenuItem>
      </StyledMenu>
    </div>
  )
}

export default EditorMenu
