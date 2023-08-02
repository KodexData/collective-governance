import { useMemo } from 'react'
import { parseProposalState, ProposalStatus } from '@collective-governance/api-evm'
import { useTranslation } from 'react-i18next'
import { useApplication } from 'hooks'
import ProposalList from './ProposalList'
import ExpandBox from 'components/customs/ExpandBox'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'

interface ProposalSidebar {
  status?: ProposalStatus
  proposalStatus?: keyof typeof ProposalStatus
  maxItems?: number
}

const ProposalSidebar: React.FC<ProposalSidebar> = (props) => {
  const { t } = useTranslation()
  const { context: { getProposals, state } } = useApplication()

  const status = useMemo(() => {
    const s = { ...props }
    if (props.proposalStatus && !props.status) {
      s.status = ProposalStatus[props.proposalStatus]
    } else if (!props.proposalStatus && props.status) {
      s.proposalStatus = parseProposalState(props.status)
    }
    return s
  }, [props.proposalStatus, props.status, state.proposalStateHash])

  const title = useMemo(() => {
    switch (status.proposalStatus) {
      case 'Active':
        return t('Active Proposals')
      case 'Canceled':
        return t('Canceled Proposals')
      case 'Defeated':
        return t('Defeated Proposals')
      case 'Executed':
        return t('Executed Proposals')
      case 'Pending':
        return t('Pending Proposals')
      case 'Queued':
        return t('Queued Proposals')
      case 'Succeeded':
        return t('Succeeded Proposals')
      default:
        return ''
    }
  }, [status])

  const proposals = useMemo(
    () =>
      getProposals(status.status)
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, props.maxItems || 10),
    [status, props.maxItems, state.proposalStateHash]
  )

  const element = useMemo(() => {
    if (!proposals || proposals.length === 0) return <></>
    return (
      <>
        <Divider />
        <ProposalList proposals={proposals} />
      </>
    )
  }, [proposals, state.proposalStateHash, state.lastStateUpdate])

  if (!proposals || proposals.length <= 0) return <></>

  return (
    <Box sx={{ mt: 2 }} textAlign='left'>
      <ExpandBox title={title.toUpperCase()} asPaper>
        {element}
      </ExpandBox>
    </Box>
  )
}

export default ProposalSidebar
