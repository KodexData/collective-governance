import type { Proposal } from 'types'
import { useApplication, useOperatorStatus } from 'hooks'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import ButtonGroup from '@mui/material/ButtonGroup'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import SxBox from 'components/customs/SxBox'

const OperatorButtons: React.FC<Proposal> = (item) => {
  const { t } = useTranslation()
  const { context: { state }, governance, update } = useApplication()
  const operator = useOperatorStatus(item)
  
  function callGovernance (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const method = e.currentTarget.name as 'queue' | 'execute' | 'cancel' | 'propose'
    let { values, targets, calldatas, description } = state.proposals[item.id]
    if (method === 'propose') description += '\n' + new Date().toISOString()
    return governance[method]([targets, values, calldatas, description])
  }

  useEffect(() => {
    update()
  }, [state.proposalStateHash, state.lastStateUpdate])

  return (
    <Collapse in={operator.isOperator}>
      <SxBox>
        <ButtonGroup fullWidth variant='outlined'>
          {operator.canQueue && (
            <>
              <Button color='info' name='queue' onClick={ev => callGovernance(ev)}>
                {t('Queue Proposal')}
              </Button>
            </>
          )}
          {operator.canExecute && (
            <>
              <Button color='success' name='execute' onClick={ev => callGovernance(ev)}>
                {t('Execute Proposal')}
              </Button>
            </>
          )}
          {operator.canCancel && (
            <>
              <Button color='warning' name='cancel' onClick={ev => callGovernance(ev)}>
                {t('Cancel Proposal')}
              </Button>
            </>
          )}
          {operator.canPropose && operator.canReopen && <>
            <Button color='success' name='propose' onClick={ev => callGovernance(ev)}>
              {t('Reopen Proposal')}
            </Button>
          </>}
        </ButtonGroup>
      </SxBox>
    </Collapse>
  )
}

export default OperatorButtons
