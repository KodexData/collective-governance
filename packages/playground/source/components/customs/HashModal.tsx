import type * as T from 'types'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme, useClipboard } from 'hooks'
import DefaultHashes from './HashModal.defaults'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import TagIcon from '@mui/icons-material/Tag'
import Collapse from '@mui/material/Collapse'
import Backdrop from '@mui/material/Backdrop'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Modal from '@mui/material/Modal'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'

interface HashModalProps {
  open?: boolean
  onClose?: () => void
  element?: JSX.Element
}

const HashModal: React.FC<HashModalProps> = (props) => {
  const { t } = useTranslation()
  const title = t('String Hashing')
  const theme = useTheme()
  const clipboard = useClipboard()
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    if (props.onClose) props.onClose()
    setOpen(false)
  }

  function handleChange(ev: T.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const value: string = ev.target.value
    setInput(value)
  }

  function handleCopy(ev?: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    clipboard.copy(result)
  }

  function handleKeydown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter') {
      handleCopy()
    }
  }

  const element = useMemo(() => {
    if (props.element) return props.element
    return (
      <Tooltip title={title} placement='bottom-end'>
        <IconButton aria-label={title} onClick={handleOpen}>
          <TagIcon />
        </IconButton>
      </Tooltip>
    )
  }, [props.element])

  const isOpen = useMemo(() => {
    if (typeof props.open === 'undefined') return open
    return props.open
  }, [props.open, open])

  useEffect(() => {
    setResult(input.toSha3())
  }, [input])

  return (
    <>
      {element}
      <Modal
        aria-labelledby='hash-modal-title'
        aria-describedby='hash-modal-description'
        open={isOpen}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={isOpen}>
          <Box
            sx={{
              position: 'absolute' as 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 5,
              [theme.breakpoints.down('md')]: {
                width: '90vw'
              }
            }}
          >
            <Typography id='hash-modal-title' variant='h2' component='h2' sx={{ mb: 2 }}>
              {title.toUpperCase()}
            </Typography>
            <Typography
              variant='caption'
              component='div'
              sx={{ mb: 2 }}
              onMouseEnter={() => setExpanded(true)}
              onMouseLeave={() => setExpanded(false)}
            >
              SHA3 (Secure Hash Algorithm 3) is a cryptographic hashing algorithm that generates a fixed-length output from any
              given input data.
              <Collapse in={expanded} timeout={666}>
                <Box>
                  It is designed to provide secure and reliable message authentication, ensuring that data remains unchanged
                  during transmission or storage. SHA3 hashing is widely used in various applications such as digital signatures,
                  password storage, and data integrity checks. It is considered to be a secure and reliable hashing algorithm,
                  resistant to attacks such as collisions and preimage attacks.
                </Box>
              </Collapse>
            </Typography>
            <TextField
              variant='outlined'
              fullWidth
              size='small'
              placeholder=''
              label={t('Input String')}
              name='STRING'
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeydown}
              autoFocus
            />
            <TextField
              variant='outlined'
              fullWidth
              size='small'
              placeholder='GWEI'
              label='SHA3'
              name='SHA3'
              value={result}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position='end'>
                      <Tooltip placement='bottom-end' title={t('Copy to Clipboard')}>
                        <IconButton size='small' name='gwei' onClick={handleCopy}>
                          <ContentCopyIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  </>
                )
              }}
            />
            <Divider />
            <Typography sx={{ mb: 2 }} variant='h5'>
              TIMELOCK CONTROLLER ROLES
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {DefaultHashes.filter((x) => x.type === 'role').map(({ hash, label, type }) => (
                <Tooltip title={hash} key={`hashes_${hash}`} placement='bottom'>
                  <Chip
                    size='small'
                    variant='outlined'
                    color='info'
                    sx={{ cursor: 'pointer' }}
                    label={`${type.toUpperCase()}: ${label}`}
                    onClick={() => {
                      clipboard.copy(hash)
                      handleClose()
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default HashModal
