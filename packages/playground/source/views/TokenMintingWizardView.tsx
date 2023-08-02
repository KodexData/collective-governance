import Collapse from '@mui/material/Collapse'
import TokenMintingWizard from 'components/wizards/TokenMintingWizard'

const TokenMintingWizardView: React.FC = (props) => {
  return (
    <>
      <Collapse in={true} timeout={666}>
        <TokenMintingWizard />
      </Collapse>
    </>
  )
}

export default TokenMintingWizardView
