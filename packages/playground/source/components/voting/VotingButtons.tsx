import type { ChangeEvent } from 'types'
import { useState, useEffect, useMemo, useContext } from 'react'
import { useApplication, useIsActiveProposal } from 'hooks'
import { useTranslation } from 'react-i18next'
import { CtxProposal } from 'context'
import ProposalEditor from 'components/proposal-editor/ProposalEditor'
import SxBox from 'components/customs/SxBox'
import InputAdornment from '@mui/material/InputAdornment'
import ArticleIcon from '@mui/icons-material/Article'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

const VotingButtons: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation()
  const editor = useContext(CtxProposal)
  const { ethers, governance } = useApplication()
  const [reason, setReason] = useState('')
  const [useEditor, setUseEditor] = useState(false)
  const [hasVoted, setHasVoted] = useState(true)
  const { isActive } = useIsActiveProposal(id)

  const showComponent = useMemo(() => {
    return isActive && !hasVoted
  }, [isActive, hasVoted])

  const handleCheckVoted = () => {
    governance.checkHasVoted(id).then((r) => {
      if (typeof r === 'undefined') return
      setHasVoted(r)
    })

    setReason('')
  }

  const handleChange = (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReason(ev.target.value)
  }

  const handleVote = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const support = Number(e.currentTarget.name)
    governance.vote(id, support, reason).then(() => {
      handleCheckVoted()
      if (useEditor) {
        editor.dispatch({ type: 'set-description', payload: '' })
        setUseEditor(false)
      }
    })
  }

  useEffect(() => {
    if (!ethers.state.address) return
    handleCheckVoted()
  }, [ethers.state.address])

  if (!showComponent) return <></>

  return (
    <>
      <Grid item lg={12} xl={12} md={12} sm={12} xs={12}>
        <Collapse in={!hasVoted} timeout={400}>
          <SxBox>
            <ButtonGroup fullWidth variant='contained' disabled={hasVoted}>
              <Button name='1' color='success' onClick={handleVote}>
                {t('Vote For')}
              </Button>
              <Button name='0' color='error' onClick={handleVote}>
                {t('Vote Against')}
              </Button>
              <Button name='2' color='warning' onClick={handleVote}>
                {t('Vote Abstain')}
              </Button>
            </ButtonGroup>
            <Collapse in={!useEditor}>
              <TextField
                label={t('Add voting reason or leave blank')}
                placeholder={t('Add voting reason or leave blank')}
                variant='outlined'
                fullWidth
                sx={{ mt: 2 }}
                value={reason}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position='end'>
                        <Tooltip title={t('Switch to Markdown editor')} placement='bottom-end'>
                          <IconButton size='small' name='wei' onClick={() => setUseEditor(!useEditor)}>
                            <ArticleIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    </>
                  )
                }}
              />
            </Collapse>
            <Collapse in={useEditor} className='voting-md-editor'>
              <ProposalEditor onChange={setReason} sx={{ mt: 2 }} />
            </Collapse>
          </SxBox>
        </Collapse>
      </Grid>
    </>
  )
}

export default VotingButtons
