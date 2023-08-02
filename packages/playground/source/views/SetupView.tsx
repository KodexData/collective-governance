import type { SxProps } from 'types'
import SetupGuide from 'components/wizards/SetupGuide'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'

const SetupView: React.FC = (props) => {
  const sxProps: SxProps = {
    textAlign: 'left',
    pt: 4, pb: 4, height: '100%',
    minHeight: '66vh'
  }
  return (
    <Container sx={sxProps} maxWidth='sm'>
      <Paper sx={{ p: 0 }}>
        <SetupGuide />
      </Paper>
    </Container>
  )
}

export default SetupView
