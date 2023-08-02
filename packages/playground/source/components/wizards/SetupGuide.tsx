import { useMemo } from 'react'
import { useLinkParams, useSetupSteps } from 'hooks'
import MobileStepper from '@mui/material/MobileStepper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import SwitchChain from './SwitchChain'

type Step = { label?: string; description?: string; element?: React.ReactNode }

const SetupGuide: React.FC = (props) => {
  const setup = useLinkParams()
  const activeStep = useSetupSteps()

  const steps = useMemo(() => {
    const steps: Step[] = [
      {
        label: 'Network Change',
        element: (
          <>
            <SwitchChain chainId={setup.chainId} description={`Please switch or add network ${setup.chainId} to Metamask`} />
          </>
        )
      },
      {
        label: 'Verify Contract Address',
        description: `Set, edit or verify Governor contract address: ${setup.contract}`
      },
      {
        label: 'Save and Continue',
        description: `Save default contract infos and continue to ${setup.id || 'homepage'}`,
        element: (
          <>
            <Box textAlign='center' sx={{ mt: 2 }}>
              <Button variant='outlined' color='success'>
                GO TO PROPOSAL
              </Button>
            </Box>
          </>
        )
      }
    ]

    return steps
  }, [setup.chainId, setup.contract, setup.id, activeStep])

  const maxSteps = steps.length

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper
        square
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 50,
          pl: 2,
          bgcolor: 'palette.primary.light'
        }}
      >
        <Typography>{steps[activeStep].label}</Typography>
      </Paper>
      <Box sx={{ width: '100%', p: 2 }}>
        {steps[activeStep].description}
        {steps[activeStep].element}
      </Box>
      <MobileStepper
        variant='text'
        steps={maxSteps}
        position='static'
        activeStep={activeStep}
        nextButton={<></>}
        backButton={<></>}
      />
    </Box>
  )
}

export default SetupGuide
