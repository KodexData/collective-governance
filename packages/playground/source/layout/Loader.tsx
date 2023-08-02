import { useTheme } from 'hooks'
import { useContext } from 'react'
import { CtxState } from 'context'
import JazzIcon from 'components/customs/JazzIcon'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Card from '@mui/material/Card'

const Loader: React.FC<{ chainId?: number }> = (props) => {
  const theme = useTheme()
  const { state } = useContext(CtxState)

  return (
    <>
      <Container
        sx={{
          textAlign: 'center',
          paddingTop: theme.spacing(4),
          paddingBottom: theme.spacing(4),
          height: '100%'
        }}
        maxWidth='xs'
      >
        <Card sx={{ p: 2, pt: 3, textAlign: 'center', borderRadius: '16px' }} elevation={2}>
          <Typography variant='h4' gutterBottom sx={{ mb: 2 }}>
            Loading Contract Data
          </Typography>
          <JazzIcon size={250} value={state.contracts.Governance || '0x0'} />
          <Divider
            sx={{
              marginTop: '1em',
              marginBottom: '3em'
            }}
          />
          <Typography variant='h6' gutterBottom sx={{ mt: 2, mb: 1 }}>
            depending on your provider this process can take a while
          </Typography>
        </Card>
      </Container>
    </>
  )
}

export default Loader
