import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { FormatBox } from './Markdown'

interface JsonAlertBoxProps {
  title: React.ReactNode
  data: Record<string, any>
  onClickExit?: () => void
}

const JsonAlertBox: React.FC<JsonAlertBoxProps> = ({ title, data, onClickExit }) => {
  return (
    <>
      <Collapse sx={{ mt: 2 }} in={typeof data !== 'undefined'} timeout={666}>
        <Alert
          action={
            <IconButton
              aria-label='close'
              color='inherit'
              size='small'
              onClick={() => {
                if (onClickExit) onClickExit()
              }}
            >
              <CloseIcon fontSize='inherit' />
            </IconButton>
          }
          severity='success'
        >
          <Box>
            {title}
            <Typography component={'pre'} variant='body1' sx={{ mt: 1 }}>
              {JSON.stringify(data, null, 2)}
            </Typography>
          </Box>
        </Alert>
      </Collapse>
    </>
  )
}

export default JsonAlertBox
