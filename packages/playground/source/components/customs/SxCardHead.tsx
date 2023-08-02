import type { SxProps } from 'types'
import { useState } from 'react'
import StyledMenu from './StyledMenu'
import Typography from '@mui/material/Typography'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'

interface DropdownItem {
  onClick: () => void
  title: string
  Icon: React.ReactNode
}
interface SxCardHeadProps {
  sx?: SxProps
  title: React.ReactNode
  dropdownItems?: DropdownItem[]
}

const SxCardHead: React.FC<SxCardHeadProps> = (props) => {
  const items = props.dropdownItems || []
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigate = (to: string) => {
    // navigate(to)
    // animateScroll.scrollToTop()
    setAnchorEl(null)
  }

  return (
    <>
      <Box sx={{ width: '100%', display: 'flex' }}>
        <Typography sx={{ flex: 1, whiteSpace: 'nowrap', ...props.sx }} variant='h4' align='left'>
          {props.title}
        </Typography>
        <Box sx={{ flex: 2, flexGrow: 10 }} />
        {items.length > 0 && <Box sx={{ flex: 3, flexGrow: 0, display: 'inline' }}>
          <IconButton
            aria-label='expand-votes'
            id='header-dropdown-button'
            aria-controls={open ? 'header-dropdown' : undefined}
            aria-haspopup='true'
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            color='inherit'
            sx={{ position: 'relative', top: '-2px' }}
            size='small'
          >
            <MoreVertIcon fontSize='small' />
          </IconButton>
        </Box>}
      </Box>
      <StyledMenu
        id='header-dropdown'
        MenuListProps={{
          'aria-labelledby': 'header-dropdown-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {items.map((item) => (
          <MenuItem key={`dropdown-${item.title}`} onClick={() => {
            item.onClick()
            handleClose()
          }} disableRipple>
            {item.Icon}
            {item.title}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  )
}

export default SxCardHead
