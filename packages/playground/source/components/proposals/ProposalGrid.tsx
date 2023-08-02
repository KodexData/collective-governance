import { useContext, useMemo } from 'react'
import { CtxState } from 'context'
import ProposalIdBox from 'components/voting/ProposalIdBox'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'

const ProposalGrid: React.FC = () => {
  const { state } = useContext(CtxState)!

  const proposals = useMemo(() => {
    return Object.values(state.proposals).sort((a, b) => b.blockNumber - a.blockNumber)
  }, [state.proposalStateHash])

  const elements = useMemo(() => {
    if (proposals.length === 0) return
    return proposals
      .filter((x) => x.status > 0)
      .map((p) => {
        const { startBlock, endBlock } = p
        return (
          <Grid key={`grid_${p.id}`} item md={6} lg={6} xl={6} sm={12} xs={12}>
            <ProposalIdBox
              asPaper
              startIndex={3}
              headline={p.headline}
              id={p.id}
              descriptionHash={p.descriptionHash}
              status={p.status}
              transactionHash={p.transactionHash}
            />
          </Grid>
        )
      })
  }, [proposals])

  return (
    <Collapse in={proposals.length > 0} timeout={666}>
      <Grid container spacing={2} sx={{ mt: '-8px' }}>
        {elements}
      </Grid>
    </Collapse>
  )
}

export default ProposalGrid
