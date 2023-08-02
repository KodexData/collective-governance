import { useTheme, useTranslation } from 'hooks'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import fox from 'assets/images/Fox.svg'

const NoWallet: React.FC = (props) => {
  const theme = useTheme()
  const { t } = useTranslation()
  return (
    <>
      <Container
        maxWidth='md'
        sx={{
          textAlign: 'center',
          paddingTop: theme.spacing(4),
          height: '100%'
        }}
      >
        <Card sx={{ p: 2, pt: 3, borderRadius: 5, minHeight: '30vh' }}>
          <Typography variant='h1' gutterBottom sx={{ mb: 2 }}>
            {t('No Wallet found')}
          </Typography>
          <img src={fox} alt='' height={256} />
          <Typography variant='body1'>{t('Your browser has not a web3 provider injected.')}</Typography>

          <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
            {t('Please switch browser or install MetaMask')}
          </Typography>
        </Card>
      </Container>
    </>
  )
}

export default NoWallet
