import { useMemo } from 'react'
import { useApplication } from 'hooks'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

const DelegateButton: React.FC<{ noCard?: boolean }> = ({ noCard }) => {
  const {
    context: { state },
    governance: { delegate }
  } = useApplication()
  const { delegation } = state

  function handleClick (_ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    delegate()
  }

  return useMemo(() => {
    const hasTokenBalance = state.delegation?.balance.gt(0)
    const isDelegatable = state.delegation?.delegates && delegation?.delegates.isEtherAddress()
    if (!isDelegatable || !hasTokenBalance) return <></>
    return (
      <>
        <Divider />
        <Button variant='outlined' color='success' onClick={handleClick}>
          DELEGATE
        </Button>
      </>
    )
  }, [state.delegation, delegation?.address, state.proposalStateHash])
}

export default DelegateButton
