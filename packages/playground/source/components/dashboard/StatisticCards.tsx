import type { SxProps } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CtxState } from 'context'
import StatCard from './StatCard'
import Grid from '@mui/material/Grid'

interface StatisticCardsProps {
  withContainer?: boolean
  containerSxProps?: SxProps
}

const StatisticCards: React.FC<StatisticCardsProps> = ({ withContainer, containerSxProps }) => {
  const { t } = useTranslation()
  const { state } = useContext(CtxState)

  const delegators = useMemo(() => {
    if (!state.delegators) return []
    return state.delegators
  }, [state.delegators])

  const proposalStats = useMemo(() => {
    const proposals = Object.values(state.proposals)

    const totalVotes = proposals.reduce((t, p) => {
      return t += p.forVotes.concat(p.forVotes).concat(p.againstVotes).length
    }, 0)

    const proposers = proposals.reduce((t, p) => {
      if (!t.includes(p.proposer)) t.push(p.proposer)
      return t
    }, [] as string[])

    return {
      total: proposals.length,
      totalVotes, proposers: proposers.length, 
      active: proposals.filter((p) => p._status === 'Active').length,
      defeated: proposals.filter((p) => p._status === 'Defeated').length,
      executed: proposals.filter((p) => p._status === 'Executed').length,
      canceled: proposals.filter((p) => p._status === 'Canceled').length
    }
  }, [state.proposalStateHash])

  return (
    <>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.total} label={t('Total Proposals')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.totalVotes} label={t('Total Votes')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.proposers} label={t('Total Proposers')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={delegators.length} label={t('Total Delegators')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.active} label={t('Active Proposals')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.executed} label={t('Executed Proposals')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.defeated} label={t('Defeated Proposals')} />
      </Grid>
      <Grid item md={3} sm={6} xs={6}>
        <StatCard value={proposalStats.canceled} label={t('Canceled Proposals')} />
      </Grid>
    </>
  )
}

const Wrapper: React.FC<StatisticCardsProps> = (props) => {
  if (props.withContainer)
    return (
      <Grid container spacing={2} sx={{ textAlign: 'left', ...props.containerSxProps }}>
        <StatisticCards {...props} />
      </Grid>
    )

  return <StatisticCards {...props} />
}

export default Wrapper
