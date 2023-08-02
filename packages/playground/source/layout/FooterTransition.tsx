import Box from '@mui/material/Box'
import shape01 from 'assets/images/shape01.svg'

const FooterTransition: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        top: 20
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: '0px',
          bottom: '-1px',
          left: '-1px',
          overflow: 'hidden',
          zIndex: '-10!important'
        }}
        className='text-dark-footer'
      >
        <img src={shape01} alt={''} style={{ zIndex: '1!important' }} />
      </Box>
    </Box>
  )
}

export default FooterTransition
