import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { useLogTableData } from 'hooks'
import Box from '@mui/material/Box'

const LogTables: React.FC = () => {
  const data = useLogTableData()

  return (
    <>
      <Box sx={{ minHeight: 800, mb: 2 }}>
        <DataGrid
          sx={{ minHeight: 800 }}
          rows={data.proposals.dataSet}
          columns={data.proposals.columns}
          density='compact'
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
      <Box sx={{ minHeight: 800 }}>
        <DataGrid
          sx={{ minHeight: 800 }}
          rows={data.votes.dataSet}
          columns={data.votes.columns}
          density='compact'
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </>
  )
}

export default LogTables
