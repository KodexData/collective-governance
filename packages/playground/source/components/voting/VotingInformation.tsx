import type { Proposal } from 'types'
import * as Hooks from 'hooks'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormatBox, MarkdownArea } from 'components/customs/Markdown'
import SxCardHead from 'components/customs/SxCardHead'
import JazzIcon from 'components/customs/JazzIcon'
import SxBox from 'components/customs/SxBox'
import RTBox from 'components/customs/RTBox'
import StatusChip from 'components/customs/StatusChip'
import DarkModal from 'components/customs/DarkModal'
import WalletInformation from './WalletInformation'
import ProposalIdBox from './ProposalIdBox'
import VoteStatusBox from './VoteStatusBox'
import VotingChart from './VotingChart'
import CommentBox from './CommentBox'
import VotesAndComments from './VotesAndComments'
import QuorumBox from './QuorumBox'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import AppsIcon from '@mui/icons-material/Apps'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

interface IVotingInformation {
  children?: React.ReactNode
  item: Proposal
  showDescription?: boolean
  showPaper?: boolean
  showStatusChip?: boolean
  hideDetails?: boolean
}

const VotingInformation: React.FC<IVotingInformation> = ({ item, children, ...props }) => {
  const { deadline } = item
  const { description } = item
  const { t } = useTranslation()
  const { governance, context } = Hooks.useApplication()
  const blocksLeft = Hooks.useBlocksLeft(deadline)
  const secondsLeft = Hooks.useSecondsLeft(blocksLeft)
  const timeLeft = Hooks.useTimeLeft(secondsLeft)
  const turnout = Hooks.useTurnout(item)
  const { canComment } = Hooks.useComments()

  const [votersOpen, setVotersOpen] = useState(false)
  const handleOpenVoters = () => setVotersOpen(true)
  const handleCloseVoters = () => setVotersOpen(false)

  const [callsOpen, setCallsOpen] = useState(false)
  const handleOpenCalls = () => setCallsOpen(true)
  const handleCloseCalls = () => setCallsOpen(false)

  const [jsonOpen, setJsonOpen] = useState(false)
  const handleOpenJson = () => setJsonOpen(true)
  const handleCloseJson = () => setJsonOpen(false)

  const toggle = () =>
    context.dispatch({ type: 'set-hide-wallet-information-box', payload: !context.state.hideWalletInformationBox })

  const w = useMemo(() => {
    if (!context.state.hideWalletInformationBox) {
      return {
        lg: 9,
        xl: 9
      }
    } else {
      return {
        lg: 12,
        xl: 12
      }
    }
  }, [context.state.hideWalletInformationBox])

  useEffect(() => {
    console.debug(`Voting Information: trigger secondsLeft: ${secondsLeft}`)
    if (Number(secondsLeft) > 0) return
    if (!secondsLeft && [0, 1, 3].includes(item.status)) {
      governance.refetch()
      console.debug(`Voting Information: proposal time expired: ${item.id}`)
    }
  }, [item, secondsLeft, item.status])

  return (
    <>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        {props.showStatusChip && (
          <StatusChip
            status={item.status}
            sx={{
              position: 'absolute',
              zIndex: 900,
              mt: '6.66px',
              ml: '6.66px'
            }}
            size={'medium'}
          />
        )}
        {item.status > 0 && (
          <>
            <Grid item lg={4} xl={4} md={6} sm={6} xs={12}>
              <QuorumBox item={item} blocksLeft={blocksLeft} timeLeft={timeLeft} />
            </Grid>
            <Grid item lg={4} xl={4} md={6} sm={6} xs={12}>
              <VoteStatusBox item={item} />
            </Grid>
            <Grid item lg={4} xl={4} md={12} sm={12} xs={12}>
              <SxBox>
                {turnout && turnout.gt(0) && (
                  <RTBox>
                    <Chip label={`${t('Turnout').toUpperCase()}: ${turnout.pretty()}%`} size={'small'} />
                  </RTBox>
                )}
                <VotingChart proposalId={item.id} />
              </SxBox>
            </Grid>
          </>
        )}
        {children}
        <Grid item lg={4} xl={4} md={6} sm={12} xs={12}>
          <SxBox textAlign={'left'} display={'flex'}>
            <JazzIcon value={item.proposer} size={80} />
            <Typography variant='h4' sx={{ flex: 1, ml: 2, mt: 2.2 }} noWrap>
              {item.proposer} <br />
              <Typography variant='caption'>{t('Proposer Address').toUpperCase()}</Typography>
            </Typography>
          </SxBox>
        </Grid>
        <Grid item lg={8} xl={8} md={6} sm={12} xs={12}>
          <ProposalIdBox
            hideChart
            id={item.id}
            status={item.status}
            headline={item.headline}
            descriptionHash={item.descriptionHash}
            transactionHash={item.transactionHash}
            hideMenu
          />
        </Grid>
        {item.status > 0 && !props.hideDetails && (
          <>
            <Grid item lg={w.lg} xl={w.xl} md={12} sm={12} xs={12}>
              <SxBox>
                <SxCardHead
                  title={t('Votes and Comments').toUpperCase()}
                  sx={{ mb: 2 }}
                  dropdownItems={[
                    {
                      onClick: toggle,
                      title: context.state.hideWalletInformationBox ? t('Show Wallet Information') : t('Hide Wallet Information'),
                      Icon: <AccountBalanceWalletIcon />
                    },
                    {
                      onClick: handleOpenVoters,
                      title: t('Expand Voters View'),
                      Icon: <AspectRatioIcon />
                    },
                    {
                      onClick: handleOpenCalls,
                      title: t('Show Contract Calls'),
                      Icon: <AppsIcon />
                    },
                    {
                      onClick: handleOpenJson,
                      title: t('Show Proposal Json as JSON'),
                      Icon: <ContentCopyIcon />
                    },
                    {
                      onClick: () => {},
                      title: t('Copy Proposal as JSON'),
                      Icon: <ContentCopyIcon />
                    }
                  ]}
                />
                <VotesAndComments id={item.id} />
              </SxBox>
            </Grid>
            {!context.state.hideWalletInformationBox && (
              <Grid item lg={3} xl={3} md={12} sm={12} xs={12}>
                <SxBox onDoubleClick={toggle}>
                  <WalletInformation noCard />
                </SxBox>
              </Grid>
            )}
          </>
        )}
        {canComment && props.showDescription && (
          <Grid item lg={12} xl={12} md={12} sm={12} xs={12}>
            <CommentBox proposalId={item.proposalId} />
          </Grid>
        )}
      </Grid>

      {props.showDescription && (
        <>
          <MarkdownArea sx={{ mt: 2 }}>{description}</MarkdownArea>
        </>
      )}

      <DarkModal open={votersOpen} handleClose={handleCloseVoters}>
        <SxCardHead
          title={t('Votes and Comments').toUpperCase()}
          dropdownItems={[{ title: 'close', Icon: <CloseIcon />, onClick: handleCloseVoters }]}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%!important', maxHeight: '100%!important', mb: 2 }}>
          <VotesAndComments id={item.id} sx={{ minHeight: '100%', maxHeight: '100%', mt: 2, flex: 1, flexGrow: 3 }} />
        </Box>
      </DarkModal>

      <DarkModal open={callsOpen} handleClose={handleCloseCalls}>
        <SxCardHead title='CONTRACT CALLS' dropdownItems={[{ title: 'close', Icon: <CloseIcon />, onClick: handleCloseCalls }]} />
        <Box sx={{ overflow: 'scroll', maxHeight: '100%' }}>
          <FormatBox
            data={{
              signatures: item.signatures,
              targets: item.targets,
              callDatas: item.calldatas,
              values: item.values
            }}
            format='JSON'
          />
        </Box>
      </DarkModal>

      <DarkModal open={jsonOpen} handleClose={handleCloseJson}>
        <SxCardHead title='PROPOSAL JSON' dropdownItems={[{ title: 'close', Icon: <CloseIcon />, onClick: handleCloseJson }]} />
        <Box sx={{ overflow: 'scroll', maxHeight: '100%' }}>
          <FormatBox data={item} format='JSON' />
        </Box>
      </DarkModal>
    </>
  )
}

export default VotingInformation
