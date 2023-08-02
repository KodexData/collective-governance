import Box from '@mui/material/Box'
import shape04 from 'assets/images/shape04.svg'

const Masthead: React.FC = () => {
  return (
    <Box
      sx={{
        maxHeight: '200px',
        width: '100%',
        position: 'absolute',
        top: 48,
        zIndex: -10,
      }}
    >
      <Box
        sx={{
          height: '180px',
          width: '100%',
          position: 'relative',
          marginRight: 'auto',
          marginLeft: 'auto'
        }}
      >
        <img src={shape04} />
      </Box>
    </Box>
  )
}

export default Masthead
