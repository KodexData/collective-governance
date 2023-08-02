import { useTheme, useTranslation } from 'hooks'
import { useContext } from 'react'
import { CtxEthers } from 'context'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'

const EnableWallet: React.FC = (props) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const { enable } = useContext(CtxEthers)

  return (
    <>
      <Container maxWidth='xs' sx={{
      textAlign: 'center',
      paddingTop: theme.spacing(4),
      minHeight: '58vh'
    }}>
        <Card sx={{ p: 2, pt: 3, textAlign: 'center', borderRadius: '16px' }} elevation={2}>
          <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
            Collective Governance
          </Typography>

          <Typography variant='h6' gutterBottom sx={{ mt: 2, mb: 1 }}>
            Contract Suite
          </Typography>

          <Button onClick={enable} variant='outlined' color='info' fullWidth>
            {t('Enable Wallet')}
          </Button>
        </Card>
      </Container>
    </>
  )
}

export default EnableWallet
