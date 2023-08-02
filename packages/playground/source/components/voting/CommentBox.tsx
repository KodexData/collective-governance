import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useComments } from 'hooks'
import { CtxProposal } from 'context'
import { BigNumber } from '@ethersproject/bignumber'
import { useState, useContext } from 'react'
import ProposalEditor from 'components/proposal-editor/ProposalEditor'
import InputAdornment from '@mui/material/InputAdornment'
import ArticleIcon from '@mui/icons-material/Article'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Collapse from '@mui/material/Collapse'
import SxBox from 'components/customs/SxBox'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import type { SxProps } from '@mui/material'

interface CommentBoxProps {
  proposalId: BigNumber | string
  sx?: SxProps
}

const CommentBox: React.FC<CommentBoxProps> = ({ proposalId, sx }) => {
  const { t } = useTranslation()
  const comments = useComments()
  const [useEditor, setUseEditor] = useState(false)
  const [comment, setComment] = useState('')
  const { dispatch } = useContext(CtxProposal)

  function handleChange (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setComment(ev.target.value)
  }

  function handleComment () {
    if (comment === '') return
    comments.comment(proposalId, comment).then(() => {
      dispatch({ type: 'set-description', payload: '' })
      setComment('')
    })
  }

  return (
    <SxBox textAlign={'left'} sx={sx}>
      <Collapse in={!useEditor}>
        <TextField
          label={t('Add Proposal Comment')}
          variant='outlined'
          fullWidth
          sx={{ mt: 2 }}
          value={comment}
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
        <ProposalEditor onChange={setComment} sx={{ mt: 2 }} />
      </Collapse>
      <ButtonGroup sx={{ mt: 2 }} fullWidth variant='contained'>
        <Button color='success' onClick={handleComment}>{t('Add Comment' as any)}</Button>
      </ButtonGroup>
    </SxBox>
  )
}

export default CommentBox
