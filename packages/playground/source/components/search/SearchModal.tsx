import type { Proposal, ProposalChartDataItem, AddressInformation } from 'types'
import { useEffect, useRef, useState } from 'react'
import { useApplication, useAddressBook } from 'hooks'
import { useDebounce } from 'use-debounce'
import { useTranslation } from 'react-i18next'
import { ProposalChart } from 'components/dashboard/ProposalChart'
import SearchResults from './SearchResults'
import InsertChartIcon from '@mui/icons-material/InsertChart'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import Collapse from '@mui/material/Collapse'
import Backdrop from '@mui/material/Backdrop'
import Divider from '@mui/material/Divider'
import Modal from '@mui/material/Modal'
import Fade from '@mui/material/Fade'

interface SearchModalProps {
  open: boolean
  handleOpen?: Function
  handleClose: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined
  children: React.ReactNode
}
const SearchModal: React.FC<SearchModalProps> = (props) => {
  const { t } = useTranslation()
  const addresses = useAddressBook()
  const [showChart, setShowChart] = useState(false)
  const [text, setText] = useState('')
  const [value] = useDebounce(text, 1000)
  const [showProgress, setShowProgress] = useState(false)
  const [searchResults, setSearchResults] = useState<Proposal[]>([])
  const [chartData, setChartData] = useState<ProposalChartDataItem[]>([])
  const [addressResults, setAddressResults] = useState<AddressInformation[]>([])
  const { open, handleClose } = props
  const inputRef = useRef<HTMLInputElement>()
  const {
    theme,
    navigate,
    context: { state }
  } = useApplication()

  const _Paper = {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    outline: 'none',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginTop: theme.spacing(4),
    width: '70vw',
    borderRadius: '5px',
    zIndex: theme.zIndex.tooltip,
    [theme.breakpoints.down('sm')]: {
      width: '95vw'
    }
  }

  const go = (hash: string) => {
    navigate(`/proposal/${hash}`)
    props.handleClose && props.handleClose({}, 'backdropClick')
    setSearchResults([])
  }

  const handleKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter' && searchResults.length > 0) {
      go(searchResults[0].id!)
    }
  }

  function lowerCaseSearch(item: string, term: string) {
    return item.toLowerCase().includes(term.toLowerCase())
  }

  useEffect(() => {
    if (!value || value === '') {
      setSearchResults([])
      setChartData([])
      setAddressResults([])
    } else {
      const all = Object.values(state.proposals)
      const result: Proposal[] = all
        .reduce((hits, proposal) => {
          if (hits.find((x) => x.id === proposal.id)) return hits
          if (
            proposal.description.includes(value) ||
            proposal.id.includes(value) ||
            proposal.proposer.includes(value) ||
            lowerCaseSearch(proposal.description, value) ||
            lowerCaseSearch(proposal.id, value) ||
            lowerCaseSearch(proposal.proposer, value)
          ) {
            return [...hits, proposal]
          }
          return hits
        }, [] as Proposal[])
        .sort((a, b) => b.blockNumber - a.blockNumber)

      const dataSet = result.reduce<ProposalChartDataItem[]>((acc, proposal) => {
        acc.push({
          blockNumber: proposal.blockNumber,
          headline: proposal.headline,
          proposalId: proposal.id,
          for: Number(proposal._forVotes.toString().shiftedBy(-18)),
          against: Number(proposal._againstVotes.toString().shiftedBy(-18)),
          abstain: Number(proposal._abstainVotes.toString().shiftedBy(-18))
        })
        return acc
      }, [])

      setChartData(dataSet.reverse())

      setSearchResults(result)

      setAddressResults(
        addresses.filter(
          (a) => a.type.toLowerCase().includes(value.toLowerCase()) || a.description.toLowerCase().includes(value.toLowerCase())
        )
      )
    }
    setShowProgress(false)
    // eslint-disable-next-line
  }, [value])

  useEffect(() => {
    return () => setSearchResults([])
    // eslint-disable-next-line
  }, [])

  return (
    <>
      {props.children}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          outline: 'none',
          maxHeight: '100vh'
        }}
      >
        <>
          <Fade in={open}>
            <div style={_Paper}>
              <InputBase
                defaultValue={''}
                onChange={(e) => {
                  setShowProgress(true)
                  setText(e.target.value)
                }}
                ref={inputRef}
                placeholder={t('Enter keywords to search')}
                onKeyDown={handleKeyDown}
                sx={{
                  height: '50px',
                  fontSize: '25px'
                }}
                type='text'
                fullWidth
                autoFocus
                endAdornment={
                  <>
                    <InputAdornment position='end'>
                      <IconButton size='large' onClick={() => setShowChart(!showChart)}>
                        <InsertChartIcon color={showChart ? 'success' : undefined} />
                      </IconButton>
                    </InputAdornment>
                  </>
                }
              />
              {showProgress && <LinearProgress />}
            </div>
          </Fade>
          {!showChart && (
            <Fade in={searchResults.length > 0 && !showChart} timeout={666}>
              <div style={{ ..._Paper, maxHeight: '80vh' }}>
                {searchResults.length > 0 && (
                  <>
                    <Typography align='right' variant='caption' paragraph>
                      {t('Search Results')}: {searchResults.length} / {Object.keys(state.proposals).length}
                    </Typography>
                    <Divider style={{ marginTop: '-10px' }} />
                    <SearchResults
                      addresses={addressResults}
                      proposals={searchResults}
                      handleClose={() => {
                        props.handleClose && props.handleClose({}, 'backdropClick')
                        setSearchResults([])
                      }}
                    />
                  </>
                )}
              </div>
            </Fade>
          )}
          {showChart && (
            <Fade in={chartData.length > 3}>
              <div style={{ ..._Paper, maxHeight: '80vh' }}>
                {searchResults.length > 0 && (
                  <>
                    <Typography align='right' variant='caption' paragraph>
                      {t('Search Results')}: {searchResults.length} / {Object.keys(state.proposals).length}
                    </Typography>
                    <Divider style={{ marginTop: '-10px' }} />
                    <Collapse in={chartData.length > 3} timeout={666}>
                      <ProposalChart data={chartData} height={333} disableAxes />
                    </Collapse>
                  </>
                )}
              </div>
            </Fade>
          )}
        </>
      </Modal>
    </>
  )
}

export default SearchModal
