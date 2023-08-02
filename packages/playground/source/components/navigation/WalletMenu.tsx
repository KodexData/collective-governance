import { useState } from 'react'
import { useApplication, useOperatorStatus } from 'hooks'
import { useTranslation } from 'react-i18next'
import DelegationModal from 'components/customs/DelegationModal'
import AddressBook from 'components/address-book/AddressBook'
import StyledMenu from 'components/customs/StyledMenu'
import HashModal from 'components/customs/HashModal'
import JazzIcon from 'components/customs/JazzIcon'
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import ArchiveIcon from '@mui/icons-material/Archive'
import IconButton from '@mui/material/IconButton'
import TagIcon from '@mui/icons-material/Tag'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'

const WalletMenu: React.FC = () => {
  const { t } = useTranslation()
  const ops = useOperatorStatus()
  const { context, governance, ethers } = useApplication()
  const [hashModalOpen, setHashModalOpen] = useState(false)
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    setAnchorEl(null)
    governance.logout()
  }

  const handleDelegateOpen = () => {
    context.dispatch({ type: 'set-delegate-open', payload: true })
    handleClose()
  }

  if (!ethers.state.address && !ethers.state.noInjectedProvider)
    return (
      <>
        <Button size='small' onClick={() => ethers.enable()} sx={{ ml: 2 }}>
          {t('Enable Wallet')}
        </Button>
      </>
    )
  if (!ethers.state.address) return <></>

  return (
    <div>
      <Tooltip title={ethers.state.address.trimAddress()} placement='bottom-end'>
        <IconButton
          id='demo-customized-button'
          aria-controls={open ? 'demo-customized-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <JazzIcon value={ethers.state.address} size={20} style={{ marginLeft: '12px' }} />
        </IconButton>
      </Tooltip>
      <StyledMenu
        id='demo-customized-menu'
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {ethers.state.balance && (
          <MenuItem onClick={handleClose} disableRipple>
            <CurrencyBitcoinIcon />
            {ethers.state.balance.toString().shiftedBy(-18).prettyNum()} ETHER
          </MenuItem>
        )}
        {!ops.canDelegate && ops.canVote && context.state.delegation && (
          <MenuItem onClick={handleClose} disableRipple>
            <FileCopyIcon />
            {context.state.delegation.delegates.trimAddress()}
          </MenuItem>
        )}
        {ops.canVote && context.state.delegation && (
          <MenuItem onClick={handleClose} disableRipple>
            <ArchiveIcon />
            {context.state.delegation.power}% {t('Vote Power').toUpperCase()}
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <AddressBook
          open={addressBookOpen}
          onClose={() => setAddressBookOpen(false)}
          element={
            <>
              <MenuItem
                onClick={() => {
                  setAddressBookOpen(!addressBookOpen)
                }}
                disableRipple
              >
                <AccountCircleIcon />
                {t('Address Book')}
              </MenuItem>
            </>
          }
        />

        <HashModal
          open={hashModalOpen}
          onClose={() => setHashModalOpen(false)}
          element={
            <>
              <MenuItem
                onClick={() => {
                  setHashModalOpen(!hashModalOpen)
                }}
                disableRipple
              >
                <TagIcon />
                SHA3 Hasher
              </MenuItem>
            </>
          }
        />

        <MenuItem onClick={handleDelegateOpen} disableRipple>
          <AccountTreeIcon />
          {t('Delegations').toUpperCase()}
        </MenuItem>
        
        <MenuItem onClick={handleLogout} disableRipple>
          <ExitToAppIcon />
          {t('Logout')}
        </MenuItem>
      </StyledMenu>
      <DelegationModal />
    </div>
  )
}

export default WalletMenu
