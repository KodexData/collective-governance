import type * as T from 'types'
import type { IconButtonProps } from '@mui/material/IconButton'
import { useMemo, useState } from 'react'
import * as Hooks from 'hooks'
import AddressList from './AddressList'
import AddAddress from './AddAddress'
import AddressStorage from './AddressStorage'
import BookOutlinedIcon from '@mui/icons-material/BookOutlined'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Backdrop from '@mui/material/Backdrop'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'

interface AddressBookProps extends IconButtonProps {
  onResult?: (value: React.SetStateAction<string>) => void
  handleClick?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  tooltipTitle?: string
  addresses?: T.AddressInformation[]
  icon?: React.ReactNode
  element?: JSX.Element
  open?: boolean
  onClose?: () => void
  addressType?: 'ADDRESS' | 'CONTRACT'
  force?: boolean
}

const AddressBook: React.FC<AddressBookProps> = ({ tooltipTitle, ...props }) => {
  const { t } = Hooks.useTranslation()
  const { ethers, theme } = Hooks.useApplication()
  const addrStore = new AddressStorage(ethers.state.chainId)
  const clipboard = Hooks.useClipboard()
  const addresses = props.addresses || Hooks.useAddressBook()
  const [addAddress, setAddAddress] = useState(false)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    if (props.onClose) props.onClose()
    setOpen(false)
  }

  const style: T.SxProps = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 550,
    height: 550,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 5,
    [theme.breakpoints.down('sm')]: {
      width: '90vw'
    }
  }

  const title = useMemo(() => {
    return tooltipTitle || t('#address-book-tooltip')
  }, [])

  const icon = useMemo(() => {
    if (props.icon) return props.icon
    return <BookOutlinedIcon fontSize={props.size} />
  }, [props.icon, props.size])

  const element = useMemo(() => {
    if (props.element) return props.element
    return (
      <Tooltip title={title} placement='bottom-end'>
        <IconButton {...props} onClick={handleOpen} aria-label={title}>
          {icon}
        </IconButton>
      </Tooltip>
    )
  }, [props.element])

  const isOpen = useMemo(() => {
    if (typeof props.open === 'undefined') return open
    return props.open
  }, [props.open, open])

  function handleClick(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const address = ev.currentTarget.id
    if (props.onResult) {
      props.onResult(address)
    } else if (typeof props.handleClick !== 'undefined') {
      props.handleClick(ev)
    } else {
      clipboard.copy(ev.currentTarget.id)
    }

    handleClose()
  }

  function saveToStorage() {
    addrStore.dump()
  }

  const filteredAddresses = useMemo(() => {
    if (!props.addressType) return addresses
    return addresses.filter((a) => a.type === props.addressType)
  }, [addresses])

  return (
    <>
      {element}
      <Modal
        aria-labelledby='unit-converter-title'
        aria-describedby='unit-converter-description'
        open={isOpen}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={isOpen}>
          <Box sx={style}>
            <Typography id='unit-converter-title' variant='h2' component='h2' sx={{ mb: 2 }}>
              {t('Address Book')} {props.addressType && `(${props.addressType})`}
            </Typography>
            {!addAddress && (
              <Box sx={{ overflowY: 'scroll', height: 400, width: '100%' }}>
                <AddressList handleClick={handleClick} addresses={filteredAddresses} />
              </Box>
            )}
            {addAddress && (
              <Box sx={{ overflowY: 'scroll', minHeight: 400, width: '100%', mt: 2 }}>
                <AddAddress />
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <ButtonGroup fullWidth variant='outlined' size='small'>
                <Button onClick={() => setAddAddress(!addAddress)}>{t('Add Address')}</Button>
                <Button onClick={saveToStorage}>{t('Save Addresses')}</Button>
              </ButtonGroup>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default AddressBook
