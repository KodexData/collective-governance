import type { SxProps } from '@mui/material'
import { useContext, createRef } from 'react'
import { mdParser } from './mdParser'
import { CtxProposal } from 'context'
import Typography from '@mui/material/Typography'
import MdEditor from 'react-markdown-editor-lite'
import Prism from 'prismjs'
import 'assets/css/github-markdown.css'
import 'react-markdown-editor-lite/lib/index.css'
import 'assets/css/prism.css'
import 'assets/css/mdeditor.css'


interface ProposalEditorProps {
  sx?: SxProps
  disableMenu?: boolean
  onChange?: (value: string) => void
}

const ProposalEditor: React.FC<ProposalEditorProps> = (props) => {
  const { state, dispatch } = useContext(CtxProposal)
  const mdEditor = createRef<MdEditor>()

  const handleEditorChange = (ev: any) => {
    if (!mdEditor.current) return
    dispatch({
      type: 'set-description',
      payload: ev.text || ''
    })
    
    if (props.onChange) {
      props.onChange(ev.text)
    }

    Prism.highlightAll()
  }

  function handleRenderHTML(text: string) {
    Prism.highlightAll()
    return mdParser.render(text)
  }


  return <Typography sx={props.sx} align='left' component='div'>
      <MdEditor
        ref={mdEditor}
        value={state.description}
        config={{ view: { md: true, menu: !props.disableMenu }, }}
        // onImageUpload={onImageUpload}
        renderHTML={handleRenderHTML}
        onChange={handleEditorChange}
        style={{ minHeight: '500px', maxHeight: '800px', marginBottom: '1em' }}
      />
  </Typography>
}

export default ProposalEditor