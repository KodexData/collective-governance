import type { Proposal } from 'types'
import { useTranslation } from 'react-i18next'
import { animateScroll } from 'react-scroll'
import { useMemo, useState } from 'react'
import { useApplication, useClipboard, useLocation } from 'hooks'
import Typography from '@mui/material/Typography'
import StatusChip from 'components/customs/StatusChip'
import JazzIcon from 'components/customs/JazzIcon'
import SxBox from 'components/customs/SxBox'
import Box from '@mui/material/Box'
import VotingResultChart from 'components/search/VotingResultChart'
import SxCardHead from 'components/customs/SxCardHead'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

interface ProposalIdBoxProps extends Pick<Proposal, 'headline' | 'descriptionHash' | 'transactionHash' | 'id' | 'status'> {
  children?: React.ReactNode
  asPaper?: boolean
  startIndex?: number
  hideChart?: boolean
  hideMenu?: boolean
}

const ProposalIdBox: React.FC<ProposalIdBoxProps> = (props) => {
  const { t } = useTranslation()
  const {
    context: { state },
    navigate,
  } = useApplication()
  const [i, setI] = useState(props.startIndex || 0)
  const clipboard = useClipboard()
  const location = useLocation()

  const values = [
    { title: t('Proposal ID').toUpperCase(), value: props.id },
    { title: t('Description Hash').toUpperCase(), value: props.descriptionHash },
    { title: t('Proposal Creation Hash').toUpperCase(), value: props.transactionHash },
    { title: props.descriptionHash, value: props.headline }
  ]

  function handleNext() {
    if (i + 1 === values.length) {
      setI(0)
    } else {
      setI(i + 1)
    }
  }

  function handleDoubleClick() {
    navigate(`/proposal/${props.id}`)
    animateScroll.scrollToTop()
  }

  function copyLink() {
    const origin = window.location.origin
    const chainId = state.chainId
    const contractAddress = state.contracts.Governance!
    const link = `${origin}/#/link/${chainId}/${contractAddress}/${props.id}`
    clipboard.copy(link)
  }

  const chart = useMemo(() => {
    if (props.hideChart) return
    return <Box sx={{ flex: 1, textAlign: 'right', margin: 0, maxWidth: 90, mr: -1, ml: 1 }}>
      <VotingResultChart height={84} proposalId={props.id} hideLegend />
    </Box>
    
  }, [props.id, props.hideChart])

  return useMemo(() => {
    const item = values[i]
    if (!item) return <></>
    const proposal = state.proposals[props.id]
    return (
      <SxBox textAlign={'left'} display={'flex'} asPaper={props.asPaper}>
        <Box sx={{ position: 'absolute', ml: '-7px', mt: '-7px', zIndex: 0 }}>
          <StatusChip status={props.status} />
        </Box>
        <Box onClick={handleDoubleClick} style={{ cursor: 'pointer' }}>
          <JazzIcon value={item.value} size={80} />
        </Box>
        {chart}
        <Typography variant='h4' sx={{ flex: 2, flexGrow: 10, ml: 2, mt: 2.2 }} noWrap>
          {item.value} <br />
          <Typography sx={{ cursor: 'pointer' }} variant='caption' onClick={handleNext} onDoubleClick={handleDoubleClick}>
            {item.title}
          </Typography>
          {props.children}
        </Typography>
        {!props.hideMenu && <Box sx={{ flex: 3, textAlign: 'right', margin: 0, maxWidth: 30, mr: -1, ml: 1 }}>
          <SxCardHead title='' dropdownItems={[
            { title: t('Copy Proposal Link'), Icon: <AccessTimeIcon />, onClick: () => copyLink() },
            { title: t('Copy Proposal as JSON'), Icon: <AccessTimeIcon />, onClick: () => clipboard.copy(JSON.stringify(proposal), { disableNotification: true }) },
            { title: t('Copy Proposal Identifier'), Icon: <ContentCopyIcon />, onClick: () => clipboard.copy(props.id) },
            { title: t('Copy Proposer Address'), Icon: <ContentCopyIcon />, onClick: () => clipboard.copy(proposal.proposer) },
            { title: t('Copy Transaction Hash'), Icon: <ContentCopyIcon />, onClick: () => clipboard.copy(proposal.transactionHash) },
          ]} />
        </Box>}
      </SxBox>
    )
  }, [i, props.id, props, state.proposalStateHash])
}

export default ProposalIdBox
