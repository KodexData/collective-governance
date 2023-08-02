import ProposalChartView from 'components/dashboard/ProposalChart'
import StatisticCards from 'components/dashboard/StatisticCards'
import LogTables from 'components/dashboard/LogTables'
import Grid from '@mui/material/Grid'

const DashboardView: React.FC = (props) => {
  return (
    <>
      <Grid container spacing={2} sx={{ textAlign: 'left' }}>
        <StatisticCards />
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <ProposalChartView />
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={12}>
          <LogTables />
        </Grid>
      </Grid>
    </>
  )
}

export default DashboardView
