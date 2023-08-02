import { useTheme } from 'hooks'
import FooterTransition from './FooterTransition'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { VERSION } from 'config'

type IFooter = {
  [index: string]: any
  footerContent?: any
  noDetails?: boolean
  appName?: string
  extended?: boolean
  style?: React.CSSProperties
}

const Footer: React.FC<IFooter> = (props) => {
  const theme = useTheme()

  return (
    <Box sx={{ marginTop: '200px' }}>
      <FooterTransition />
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper || 'rgb(28,32,33)'
        }}
        style={{ ...props.style }}
      >
        <Box
          sx={{
            textAlign: 'center',
            marginTop: '-3m',
            paddingBottom: '0.2em'
          }}
        >
          <br />
          <Box
            sx={{
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: '2em'
            }}
          >
            <Typography variant='h6' align='center'>
              Collective Governance
              <br />
              <Typography variant='caption'>{VERSION}</Typography>
            </Typography>

            <Typography align='center'>
              <Typography variant='caption'>
                Fully Decentralized EVM on-chain voting environment <br />
                implements OpenZeppelin governance contracts
              </Typography>
            </Typography>
          </Box>
        </Box>
        {props.footerContent}
      </Box>
    </Box>
  )
}
export default Footer
