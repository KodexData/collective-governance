import type { Proposal, AddressInformation } from 'types'
import List from '@mui/material/List'
import ProposalResultRow from './ProposalResultRow'
import AddressResultRow from './AddressResultRow'
import Divider from '@mui/material/Divider'

interface SearchResultsProps {
  addresses: AddressInformation[]
  proposals: Proposal[]
  handleClose?: Function
}

const SearchResults: React.FC<SearchResultsProps> = ({ proposals, handleClose, addresses }) => {
  return (
    <List
      sx={{
        display: 'block',
        maxHeight: '90%',
        width: '100%',
        backgroundColor: 'background.paper',
        overflowY: 'scroll'
      }}
    >
      {proposals.map((article, i) => (
        <ProposalResultRow
          key={'result_' + article.id}
          {...article}
          noDivider={i === proposals.length - 1}
          handleClose={handleClose}
        />
      ))}
      <Divider />
      {addresses.map((info, i) => (
        <AddressResultRow
          key={`key_result_${info.hash}`}
          {...info}
          noDivider={i === addresses.length - 1}
          handleClose={handleClose}
        />
      ))}
    </List>
  )
}

export default SearchResults
