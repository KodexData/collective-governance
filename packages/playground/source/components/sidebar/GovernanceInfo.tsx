import type { TypographyProps } from '@mui/material/Typography'
import type { ChangeEvent } from 'react'
import { useApplication, useTotalDelegated } from 'hooks'
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Timeline } from 'react-twitter-widgets'
import ExpandCard from 'components/customs/ExpandCard'
import JazzIcon from 'components/customs/JazzIcon'
import SxCard from 'components/customs/SxCard'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import InsertCommentIcon from '@mui/icons-material/InsertComment'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import PercentIcon from '@mui/icons-material/Percent'
import ListItemText from '@mui/material/ListItemText'
import WidgetsIcon from '@mui/icons-material/Widgets'
import WalletIcon from '@mui/icons-material/Wallet'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import Tooltip from '@mui/material/Tooltip'

const GovernanceInfo: React.FC = () => {
  const { t } = useTranslation()
  const totalDelegated = useTotalDelegated()
  const [contractAddress, setContractAddress] = useState('')
  const [showGovernanceInfo, setShowGovernanceInfo] = useState(false)
  const [showTokenInfo, setShowTokenInfo] = useState(false)
  const [showTextfield, setShowTextfield] = useState(false)
  const [showTwitter, setShowTwitter] = useState(false)
  const [disableTextfield, setDisableTextfield] = useState(false)
  const {
    ethers,
    governance,
    context: { state }
  } = useApplication()
  const { contracts, tokenInfo } = state

  const lProps: TypographyProps = {
    style: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }

  const onTwitter = (): void => {
    setTimeout(() => setShowTwitter(true), 1000)
  }

  const twitler: string | undefined = useMemo(() => {
    if (!tokenInfo?.website) return
    return tokenInfo?.website.getTwitterUsername()
  }, [tokenInfo])

  const toggleTextfield = () => setShowTextfield(!showTextfield)
  const toggleGovInfo = () => setShowGovernanceInfo(!showGovernanceInfo)
  const toggleTokenInfo = () => setShowTokenInfo(!showTokenInfo)

  const changeAddress = (ev: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setContractAddress(ev.target.value)
  }

  useEffect(() => {
    if (!contractAddress || !contractAddress.isAddress()) return
    setDisableTextfield(true)
    governance.initialize(contractAddress).then(() => {
      setShowTextfield(false)
      setDisableTextfield(false)
      setContractAddress('')
    })
    //eslint-disable-next-line
  }, [contractAddress])

  if (!contracts.Governance || !contracts.TimelockController || !contracts.DaoToken) {
    return <Typography>{t('Loading Governance Information').toUpperCase()}</Typography>
  }

  return (
    <>
      <ExpandCard title={t('Governance Information').toUpperCase()} sx={{ p: 2, pt: 2 }}>
        <Divider />
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper'
          }}
        >
          <ListItemButton onClick={toggleGovInfo}>
            <ListItemAvatar onDoubleClick={toggleTextfield}>
              <Avatar>
                <JazzIcon value={contracts.Governance} size={24} />
              </Avatar>
            </ListItemAvatar>
            {showTextfield && (
              <TextField
                value={contractAddress}
                onChange={changeAddress}
                label={t('Governance Contract Address')}
                disabled={disableTextfield}
                fullWidth
              />
            )}
            {!showTextfield && (
              <ListItemText
                primary={contracts.Governance}
                secondary={t('Governance Contract Address')}
                primaryTypographyProps={lProps}
              />
            )}
          </ListItemButton>
          <Collapse in={showGovernanceInfo} timeout={666}>
            {state.governorInformation && (
              <List component='div' sx={{ pl: 2 }} dense>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <WalletIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.governorInformation.mode}
                    secondary={t('Counting Mode')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PercentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.governorInformation.numerator + ' % of Total Supply'}
                    secondary={t('Quorum Fraction')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>

                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <WidgetsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.governorInformation.votingPeriod.toLocaleString() + ' blocks'}
                    secondary={t('Voting Period')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <WidgetsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.governorInformation.votingDelay.toLocaleString() + ' blocks'}
                    secondary={t('Voting Delay')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AccountBalanceIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      state.governorInformation.proposalThreshold.toString().shiftedBy(-18).prettyNum() +
                      ` ${tokenInfo?.symbol || ''}`
                    }
                    secondary={t('Proposal Threshold')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <AccountBalanceWalletIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      state.governorInformation.quorum.toString().shiftedBy(-18).prettyNum() + ` ${tokenInfo?.symbol || ''}`
                    }
                    secondary={t('Current Quorum')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
              </List>
            )}
          </Collapse>
          <Divider variant='inset' component='li' />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <JazzIcon value={contracts.TimelockController} size={24} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={contracts.TimelockController}
              secondary={t('Timelock Contract Address')}
              primaryTypographyProps={lProps}
            />
          </ListItem>
          <Divider variant='inset' component='li' />
          <ListItemButton onClick={toggleTokenInfo}>
            <ListItemAvatar>
              <Avatar>
                <JazzIcon value={contracts.DaoToken} size={24} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={contracts.DaoToken} secondary={t('Token Contract Address')} primaryTypographyProps={lProps} />
          </ListItemButton>
          <Collapse in={showTokenInfo} timeout={666}>
            {state.tokenInfo && (
              <List component='div' sx={{ pl: 2 }} dense>
                <ListItem>
                  <ListItemAvatar
                    onClick={() =>
                      ethers.watchAsset(state.tokenInfo!.address, state.tokenInfo!.symbol, state.tokenInfo!.decimals)
                    }
                  >
                    <Tooltip title='add token to metamask' placement='left'>
                      <Avatar>
                        <DoubleArrowIcon />
                      </Avatar>
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText primary={state.tokenInfo.name} secondary={t('Token Name')} primaryTypographyProps={lProps} />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <DoubleArrowIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${state.tokenInfo.totalSupply.toString().shiftedBy(-state.tokenInfo.decimals).prettyNum()} (${
                      state.tokenInfo.symbol
                    })`}
                    secondary={t('Token Total Supply')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
                {totalDelegated && (
                  <>
                    <Divider variant='inset' component='li' />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <DoubleArrowIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${totalDelegated.prettyNum()} (${state.tokenInfo.symbol})`}
                        secondary={t('Total Delegated Token Supply')}
                        primaryTypographyProps={lProps}
                      />
                    </ListItem>
                  </>
                )}
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <DoubleArrowIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.tokenInfo.members.length.toLocaleString() + ' verified'}
                    secondary={t('DAO Members')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <DoubleArrowIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.tokenInfo.website || 'none'}
                    primaryTypographyProps={lProps}
                    secondary={t('DAO Website')}
                  />
                </ListItem>
                <Divider variant='inset' component='li' />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <DoubleArrowIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={state.tokenInfo.manifest || 'none'}
                    secondary={t('DAO Manifest')}
                    primaryTypographyProps={lProps}
                  />
                </ListItem>

                <Divider variant='inset' component='li' />
                {state.tokenInfo.commentThreshold && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <InsertCommentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${state.tokenInfo.commentThreshold.toString().shiftedBy(-state.tokenInfo.decimals).prettyNum()} ${
                        state.tokenInfo.symbol
                      }`}
                      secondary={t('Comment Threshold')}
                      primaryTypographyProps={lProps}
                    />
                  </ListItem>
                )}
              </List>
            )}
          </Collapse>
          {contracts.Treasury && (
            <>
              <Divider variant='inset' component='li' />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <JazzIcon value={contracts.Treasury} size={24} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contracts.Treasury}
                  secondary={t('Treasury Contract Address')}
                  primaryTypographyProps={lProps}
                />
              </ListItem>
            </>
          )}
          {contracts.DaoRegistry && (
            <>
              <Divider variant='inset' component='li' />
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <JazzIcon value={contracts.DaoRegistry} size={24} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={contracts.DaoRegistry} secondary={t('DaoRegistry Contract Address')} />
              </ListItem>
            </>
          )}
        </List>
      </ExpandCard>
      {twitler && (
        <Collapse in={showTwitter} timeout={666}>
          <SxCard sx={{ mt: 2 }}>
            <Timeline
              dataSource={{
                sourceType: 'profile',
                screenName: twitler
              }}
              options={{
                height: '600'
                //theme: 'dark'
              }}
              onLoad={onTwitter}
            />
          </SxCard>
        </Collapse>
      )}
    </>
  )
}

export default GovernanceInfo
