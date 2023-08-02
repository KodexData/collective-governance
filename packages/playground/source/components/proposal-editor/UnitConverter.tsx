import type * as T from 'types'
import { useState } from 'react'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Backdrop from '@mui/material/Backdrop'
import Tooltip from '@mui/material/Tooltip'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'
import Box from '@mui/material/Box'

const style: T.SxProps = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 5
}

interface UnitConverterProps {
  onUnits?: (uint: UintObject) => void
  onResult?: (result: string) => void
}

type UintObject = {
  wei: string
  gwei: string
  ether: string
}

const initialUnits: UintObject = {
  wei: '0', gwei: '0', ether: '0'
}

const title = 'open ethereum unit converter tool'

const UnitConverter: React.FC<UnitConverterProps> = (props) => {
  const [units, setUnits] = useState<UintObject>(initialUnits)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setUnits(initialUnits)
    setOpen(false)
  }

  const calculate = (unit: string, value: string): UintObject => {
    const calc = { ...units }
    switch (unit) {
      case 'WEI':
        calc.ether = value.shiftedBy(-18)
        calc.gwei = value.shiftedBy(-9)
        calc.wei = value
        break
      case 'GWEI':
        calc.ether = value.shiftedBy(9)
        calc.gwei = value
        calc.wei = value.shiftedBy(-9)
        break
      case 'ETHER':
        calc.ether = value
        calc.gwei = value.shiftedBy(9)
        calc.wei = value.shiftedBy(18)
        break
    }

    return calc as UintObject
  }

  const handleChange = (ev: T.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = ev.target.value
    const unit = ev.target.name
    const calc = calculate(unit, value)

    if (props.onUnits) props.onUnits(calc)
    setUnits(calc)
  }

  const handleResult = (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const unit = ev.currentTarget.name as keyof UintObject
    if (props.onResult && units[unit]) props.onResult(units[unit])
    handleClose()
  }

  if (!units) return <></>

  return (
    <>
      <Tooltip title={title} placement='bottom-end'>
        <IconButton aria-label={title} onClick={handleOpen}>
          <CalculateOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Modal
        aria-labelledby='unit-converter-title'
        aria-describedby='unit-converter-description'
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id='unit-converter-title' variant='h2' component='h2' sx={{ mb: 2 }}>
              Ethereum Unit Converter
            </Typography>
            <TextField
              variant='outlined'
              fullWidth
              size='small'
              placeholder='WEI'
              label='WEI'
              name='WEI'
              value={units.wei}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position='end'>
                      <IconButton size='small' name='wei' onClick={handleResult}>
                        <KeyboardDoubleArrowRightIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                )
              }}
            />
            <TextField
              variant='outlined'
              fullWidth
              size='small'
              placeholder='GWEI'
              label='GWEI'
              name='GWEI'
              value={units.gwei}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position='end'>
                      <IconButton size='small' name='gwei' onClick={handleResult}>
                        <KeyboardDoubleArrowRightIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                )
              }}
            />
            <TextField
              variant='outlined'
              fullWidth
              size='small'
              placeholder='ETHER'
              label='ETHER'
              name='ETHER'
              value={units.ether}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <>
                    <InputAdornment position='end'>
                      <IconButton size='small' name='ether' onClick={handleResult}>
                        <KeyboardDoubleArrowRightIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                )
              }}
            />
          </Box>
        </Fade>
      </Modal>
    </>
  )
}

export default UnitConverter
