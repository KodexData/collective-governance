import type { SxProps } from 'types'
import Backdrop from '@mui/material/Backdrop'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'

const modalStyle: SxProps = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '75vw',
  height: '90vh',
  bgcolor: 'background.default',
  border: '1px solid darkgrey',
  boxShadow: 24,
  p: 4,
  borderRadius: 5
}

interface DarkModalProps {
  sx?: SxProps
  open?: boolean
  handleClose: () => void
  children: React.ReactNode
}

const DarkModal: React.FC<DarkModalProps> = ({ open, handleClose, children, sx }) => {
  return <>
      <Modal
        aria-labelledby='hash-modal-title'
        aria-describedby='hash-modal-description'
        open={Boolean(open)}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={Boolean(open)}>
          <Box sx={{ ...modalStyle, ...sx }}>
            {children}
          </Box>
        </Fade>
      </Modal>
  </>
}

export default DarkModal