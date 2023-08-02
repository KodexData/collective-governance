import type { AddressInformation } from 'types'
import { useTranslation, useClipboard } from 'hooks'
import JazzIcon from 'components/customs/JazzIcon'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import ListItem from '@mui/material/ListItem'
import Divider from '@mui/material/Divider'

type ProposalResultRowProps = { noDivider?: boolean; handleClose?: Function } & AddressInformation

const AddressResultRow: React.FC<ProposalResultRowProps> = (props) => {
  const { t } = useTranslation()
  const clipboard = useClipboard()
  const { hash, description } = props

  return (
    <>
      <ListItem button component='a' alignItems='flex-start'>
        <ListItemAvatar sx={{ mr: 2 }}>
          <JazzIcon value={hash} size={68} />
        </ListItemAvatar>
        <ListItemText
          primary={hash}
          secondary={
            <>
              <Typography component='span' variant='body1' color='textPrimary' sx={{ display: 'inline' }}>
                {description}
              </Typography>
            </>
          }
          primaryTypographyProps={{
            variant: 'h2'
          }}
          onClick={() => {
            clipboard.copy(hash)
            props.handleClose && props.handleClose()
          }}
        />
        {/* <ListItemAvatar sx={{ mr: 0, mt: 0, textAlign: 'right', p: 0 }}>
          <VotingResultChart proposalId={id} height={150} hideLegend />
        </ListItemAvatar> */}
      </ListItem>
      {!props.noDivider && <Divider variant='inset' component='li' />}
    </>
  )
}

export default AddressResultRow
