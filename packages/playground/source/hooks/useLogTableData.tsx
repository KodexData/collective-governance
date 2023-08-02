import type { GridRowsProp, GridColDef } from '@mui/x-data-grid/models'
import { CtxState, CtxGovernance } from 'context'
import { useContext, useMemo } from 'react'
import JazzIcon from 'components/customs/JazzIcon'

const voteColumns: GridColDef[] = [
  { field: 'col1', headerName: 'BLK', width: 80 },
  {
    field: 'hash',
    headerName: ' ',
    width: 16,
    renderCell: (params) => {
      return <JazzIcon value={params.value} size={24} />
    }
  },
  { field: 'col2', headerName: 'Proposal ID', width: 500 },
  { field: 'col4', headerName: 'Support', width: 120, type: 'number' },
  { field: 'col5', headerName: 'Weight', width: 100, type: 'number' }
]

const proposalColumns: GridColDef[] = [
  { field: 'col1', headerName: 'BLK', width: 80 },
  {
    field: 'hash',
    headerName: ' ',
    width: 16,
    renderCell: (params) => {
      return <JazzIcon value={params.value} size={24} style={{ marginRight: 'auto', marginLeft: 'auto' }} />
    }
  },
  { field: 'col2', headerName: 'Proposal ID', width: 500 },
  { field: 'col4', headerName: 'Start Block', width: 120, type: 'number' },
  { field: 'col5', headerName: 'End Block', width: 120, type: 'number' }
]

/**
 * Hook that returns the data for the log tables.
 * @date 27.4.2023 - 00:20:49
 *
 * @export
 * @returns {*} Object containing the proposals and votes data for the log tables.
 */
export default function useLogTableData() {
  const ctx = useContext(CtxState)
  const governance = useContext(CtxGovernance)

  const voteLogData: GridRowsProp = useMemo(() => {
    const { voteCast } = governance.api.eventLogs
    const data = Array.from(voteCast.values()).sort((a, b) => b.blockNumber - a.blockNumber)
    return data.map((p, id) => ({
      id,
      col1: Number(p.blockNumber),
      hash: p.args.voter,
      col2: p.args.proposalId,
      col4: Number(p.args.support),
      col5: Number(p.args.weight.toString().shiftedBy(-18))
    }))
  }, [ctx.state.lastStateUpdate, governance.api.eventLogs.voteCast.size])

  const createProposalData: GridRowsProp = useMemo(() => {
    const { created } = governance.api.eventLogs
    const data = Array.from(created.values()).sort((a, b) => b.blockNumber - a.blockNumber)
    return data.map((p, id) => ({
      id,
      col1: Number(p.blockNumber),
      hash: p.args.proposer,
      col2: p.args.proposalId.toString(),
      col4: Number(p.args.startBlock),
      col5: Number(p.args.endBlock)
    }))
  }, [ctx.state.lastStateUpdate, governance.api.eventLogs.voteCast.size])

  return useMemo(() => {
    return {
      proposals: {
        columns: proposalColumns,
        dataSet: createProposalData
      },
      votes: {
        columns: voteColumns,
        dataSet: voteLogData
      }
    }
  }, [createProposalData, voteLogData])
}
