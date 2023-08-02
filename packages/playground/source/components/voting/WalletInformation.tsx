import type { TypographyProps } from '@mui/material/Typography'
import { useMemo } from 'react'
import { useApplication } from 'hooks'
import { useTranslation } from 'react-i18next'
import SxCardHead from 'components/customs/SxCardHead'
import JazzIcon from 'components/customs/JazzIcon'
import DelegateButton from './DelegateButton'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import PercentIcon from '@mui/icons-material/Percent'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import List from '@mui/material/List'

const lProps: TypographyProps = {
  style: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}

const WalletInformation: React.FC<{ noCard?: boolean }> = ({ noCard }) => {
  const { t, i18n } = useTranslation()
  const {
    ethers,
    context: { state }
  } = useApplication()
  const { tokenInfo, delegation } = state

  if (!tokenInfo || !ethers.state.address || !delegation)
    return (
      <Typography>
        LOADING TOKEN DELEGATION
        {!tokenInfo && <Typography>NO TOKEN INFO</Typography>}
        {!ethers.state.address && <Typography>NO WALLET ADDRESS</Typography>}
        {!delegation && <Typography>DELEGATION DATA LOADING</Typography>}
      </Typography>
    )

  const element = useMemo(() => {
    return (
      <>
        <SxCardHead title={t('Wallet Information').toUpperCase()} sx={{ pb: -1 }} />
        <Divider />
        <List
          sx={{
            width: '100%',
            bgcolor: noCard ? 'background.default' : 'background.paper'
          }}
        >
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <JazzIcon value={ethers.state.address!} size={24} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primaryTypographyProps={lProps} primary={ethers.state.address} secondary={t('My Wallet Address')} />
          </ListItem>
          {!delegation.delegates.isEtherAddress() && (
            <>
              <Divider variant='inset' component='li' />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <JazzIcon value={delegation.delegates} size={24} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primaryTypographyProps={lProps} primary={delegation.delegates} secondary={t('Delegated Address')} />
              </ListItem>
            </>
          )}
          {delegation.votes && (
            <>
              <Divider variant='inset' component='li' />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <ThumbUpIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primaryTypographyProps={lProps} primary={delegation.votes.pretty()} secondary={t('My Votes')} />
              </ListItem>
            </>
          )}
          <Divider variant='inset' component='li' />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AccountBalanceIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primaryTypographyProps={lProps}
              primary={`${delegation.balance.toString().shiftedBy(-tokenInfo.decimals).prettyNum()} ${tokenInfo.symbol}`}
              secondary={t('My Token Balance')}
            />
          </ListItem>
          <Divider variant='inset' component='li' />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <PercentIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primaryTypographyProps={lProps} primary={delegation.power! + ' %'} secondary={t('My Voting Power')} />
          </ListItem>
        </List>
        <DelegateButton />
      </>
    )
  }, [tokenInfo, ethers.state.address, delegation, i18n.language])

  if (noCard) return element
  else return <Card sx={{ p: 2, pt: 3, mt: 2 }}>{element}</Card>
}

export default WalletInformation
