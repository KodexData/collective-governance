import { CtxState } from 'context'
import { useContext } from 'react'
import SxCard from 'components/customs/SxCard'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

const SetupWizardView: React.FC = (props) => {
  const ctx = useContext(CtxState)

  return (
    <>
      <Collapse in={true} timeout={666}>
        <SxCard sx={{ textAlign: 'left' }}>
          <Typography variant='h2'>SETUP WIZARD</Typography>
          <Divider />
          <Typography variant='caption'>Initial Governance Setup Proposal Wizard</Typography>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item md={5}></Grid>
              <Grid item md={7}></Grid>
            </Grid>
          </Box>
        </SxCard>
      </Collapse>
    </>
  )
}

export default SetupWizardView
