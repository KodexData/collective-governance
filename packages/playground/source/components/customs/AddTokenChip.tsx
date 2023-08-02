import { useApplication, useTranslation } from 'hooks'
import MetamaskIcon from './MetamaskIcon'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

const AddTokenChip: React.FC = () => {
  const { context, ethers } = useApplication()
  const { t } = useTranslation()

  function handleAddToken(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!context.state.tokenInfo) return
    const { address, symbol, name, decimals } = context.state.tokenInfo
    ethers.watchAsset(address, symbol, decimals)
  }

  return (
    <Chip
      onClick={handleAddToken}
      sx={{ cursor: 'pointer' }}
      avatar={
        <Box sx={{ maxHeight: 16, maxWidth: 16, pl: 0.3 }}>
          <MetamaskIcon height={16} width={16} />
        </Box>
      }
      label={t('Add token to Metamask')}
      variant='outlined'
    />
  )
}

export default AddTokenChip
