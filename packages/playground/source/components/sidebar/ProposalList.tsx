import type { Proposal } from 'types'
import { useMemo, Fragment, useState } from 'react'
import { useStartsIn, useTurnout } from 'hooks'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { animateScroll } from 'react-scroll'
import { FormatBox } from 'components/customs/Markdown'
import { Utils } from '@kodex-data/prototypes'
import StatusChip from 'components/customs/StatusChip'
import JazzIcon from 'components/customs/JazzIcon'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import Chip from '@mui/material/Chip'

const ProposalItem: React.FC<Proposal> = (item) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { headline, status, id } = item
  const { startBlock, endBlock, proposer } = item
  const blockRange = `#${startBlock.prettyNum()} - #${endBlock.prettyNum()}`
  const timeLeft = useStartsIn(item)
  const turnOut = useTurnout(item.id)
  const timeLeftLabel = useMemo(() => {
    if (turnOut && item.status > 3) {
      return `${t('Turnout').toUpperCase()}: ${turnOut.pretty()}%`
    }
    if (timeLeft) return `${t('Starts in').toUpperCase()}: ${timeLeft}`
  }, [timeLeft, i18n.language])

  const handleClick = () => {
    navigate(`/proposal/${id}`)
    animateScroll.scrollToTop()
  }

  return (
    <ListItemButton alignItems='flex-start' onClick={handleClick}>
      <ListItemAvatar>
        <Avatar alt={`${t('Proposer').toUpperCase()}: ${proposer}`}>
          <JazzIcon value={id} size={52} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={headline}
        secondary={
          <Fragment>
            <StatusChip status={status} />
            <Chip label={timeLeftLabel || blockRange} size={'small'} sx={{ ml: 1, textOverflow: 'ellipsis' }} />
          </Fragment>
        }
        primaryTypographyProps={{
          variant: 'body2',
          sx: { mb: 0.5, fontSize: 20 }
        }}
        secondaryTypographyProps={{
          component: 'div'
        }}
      />
    </ListItemButton>
  )
}

const ProposalList: React.FC<{ proposals: Proposal[] }> = ({ proposals }) => {
  const { i18n } = useTranslation()
  const [showJson, setShowJson] = useState(false)
  const elements = useMemo(() => {
    const items = proposals.map((v) => <ProposalItem key={`proposal_list_${v.id}_${v.descriptionHash}`} {...v} />)
    return items
  }, [proposals, i18n.language])

  if (showJson) return <FormatBox data={proposals} format='YAML' />
  return <List sx={{ width: '100%' }}>{elements}</List>
}

export default ProposalList
