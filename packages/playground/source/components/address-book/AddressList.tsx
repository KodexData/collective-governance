import type * as T from 'types'
import type { TypographyProps } from '@mui/material/Typography'
import { calculateVotingPower } from '@collective-governance/api-evm'
import { useMemo } from 'react'
import { useApplication } from 'hooks'
import JazzIcon from 'components/customs/JazzIcon'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import List from '@mui/material/List'
import Box from '@mui/material/Box'

const lProps: TypographyProps = {
  style: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}

interface AddressListProps {
  addresses?: T.AddressInformation[]
  handleClick: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const AddressList: React.FC<AddressListProps> = (props) => {
  const { context, ethers } = useApplication()
  const activeAddresses = [...Object.values(context.state.contracts), ethers.state.address]

  function getVotingPower(address: T.AddressInformation) {
    if (address.type !== 'ADDRESS' || !address.description.toLowerCase().includes('delegator')) return <></>
    if (!context.state.delegators || !context.state.tokenInfo) return <></>
    const {
      delegators,
      tokenInfo: { totalSupply }
    } = context.state
    const result = delegators.find((x) => x.delegator.addrIsEqual(address.hash))!
    if (!result || !result.votes) return <>ERROR</>
    return <Box>VOTING POWER: {calculateVotingPower(result.votes, totalSupply)} %</Box>
  }

  const elements = useMemo(() => {
    const addresses = props.addresses || []

    return addresses.map((address, index) => (
      <ListItemButton
        id={address.hash}
        onClick={props.handleClick as any}
        alignItems='flex-start'
        key={`address_list_${index}_${address.hash}`}
      >
        <ListItemAvatar>
          {activeAddresses.includes(address.hash) ? (
            <Badge
              color='success'
              variant='dot'
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
            >
              <JazzIcon value={address.hash} size={48} />
            </Badge>
          ) : (
            <Box>
              <JazzIcon value={address.hash} size={48} />
            </Box>
          )}
        </ListItemAvatar>
        <ListItemText
          primaryTypographyProps={lProps}
          primary={<>{address.hash}</>}
          secondary={
            <>
              <Typography sx={{ display: 'inline-block' }} component='span' variant='body2' color='text.primary'>
                {address.type}
              </Typography>
              {' - '} {address.description}
              {getVotingPower(address)}
            </>
          }
        />
      </ListItemButton>
    ))
  }, [props.addresses])

  return <List sx={{ width: '100%', bgcolor: 'background.paper' }}>{elements}</List>
}

export default AddressList
