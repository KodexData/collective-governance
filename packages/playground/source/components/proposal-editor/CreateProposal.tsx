import type * as T from 'types'
import type { SelectChangeEvent } from '@mui/material/Select'
import { useContext, useEffect, useState } from 'react'
import { Element as Anchor, scroller } from 'react-scroll'
import { useLocation } from 'react-router-dom'
import { useApplication } from 'hooks'
import { CtxProposal } from 'context'
import { useTranslation } from 'react-i18next'
import AddressBook from 'components/address-book/AddressBook'
import SxCard from 'components/customs/SxCard'
import DrawOperations from './DrawOperations'
import ParameterInput from './ParameterInput'
import AbiMethodBox from './AbiMethodBox'
import AbiList from './AbiList'
import ProposalEditor from './ProposalEditor'
import InputAdornment from '@mui/material/InputAdornment'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

const CreateProposal: React.FC = () => {
  const { t } = useTranslation()
  const editor = useContext(CtxProposal)
  const { ethers, context, governance } = useApplication()
  const { defaultAbis, defaultContracts } = governance
  const { state, dispatch } = context
  const { hash } = useLocation()

  // local states for user inputs
  const [target, setTarget] = useState<string>('')
  const [abis, setAbis] = useState<T.FunctionFragment[] | null>(null)
  const [inputAbi, setInputAbi] = useState('')
  const [selectedAbi, setSelectedAbi] = useState('')
  const [selectedAbiIndex, setSelectedAbiIndex] = useState<number>()
  const [parameters, setParameters] = useState<T.FnParameters>({})

  const [paramsValid, setParamsValid] = useState(false)
  const [error, setError] = useState<Error>()

  const reset = () => {
    setError(undefined)
    resetTempOperation()
    editor.dispatch({ type: 'reset-proposal' })
  }

  const resetTempOperation = () => {
    setTarget('')
    setParameters({})
    setParamsValid(false)
    setSelectedAbi('')
    setSelectedAbiIndex(undefined)
    setAbis(null)
    setInputAbi('')
  }

  const addOperation = () => {
    if (!selectedAbiIndex || !abis) return
    const abi = abis[selectedAbiIndex]
    editor.addOperation({ abi, parameters, target })
    resetTempOperation()
  }

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedAbiIndex(Number(event.target.value))
    setParameters({})
  }
  
  const handleChangeDefaultAbi = (event: SelectChangeEvent) => {
    const item: string = event.target.value as string
    const abi = defaultAbis[item as keyof typeof defaultAbis]
    const addr: string | undefined =
      state.contracts[item as keyof typeof state.contracts] ||
      //@ts-ignore
      (defaultContracts[String(ethers.state.chainId) as any] &&
        //@ts-ignore
        defaultContracts[String(ethers.state.chainId) as any][item as any])

    if (abi) {
      setInputAbi(JSON.stringify(abi))
      setSelectedAbi(item)
    }

    if (addr && addr.isAddress()) {
      setTarget(addr)
    }

    setParameters({})
  }

  const closeEditor = () => {
    dispatch({ type: 'set-editor-open', payload: false })
  }

  const handleNewParams = (ev: T.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const i = Number(ev.target.name)
    const newParams = { ...parameters }
    newParams[i] = ev.target.value
    setParameters(newParams)
  }

  useEffect(() => {
    if (!inputAbi || !inputAbi.isValidJSON()) return
    try {
      const candidate = JSON.parse(inputAbi)
      setAbis(candidate)
    } catch (error) {
      setAbis(null)
      setParameters({})
    }
    //eslint-disable-next-line
  }, [inputAbi])

  useEffect(() => {
    if (!selectedAbiIndex || !abis) return
    setParamsValid(
      editor.verifyParams({
        abi: abis[selectedAbiIndex],
        parameters
      })
    )
    //eslint-disable-next-line
  }, [parameters])

  useEffect(() => {
    if (!hash) return
    scroller.scrollTo(hash.replace('#', ''), {
      duration: 800,
      delay: 150,
      smooth: 'easeInOutQuart'
    })
  }, [hash])

  return (
    <>
      <SxCard sx={{ p: 2, pt: 2, mb: 2 }}>
        <AbiList value={selectedAbi} onChange={handleChangeDefaultAbi} />
        {!abis && (
          <TextField
            label={t('Paste ABI data of desired contract')}
            variant='outlined'
            fullWidth
            multiline
            minRows={5}
            value={inputAbi}
            onChange={(ev) => setInputAbi(ev.target.value)}
          />
        )}
        <AbiMethodBox abis={abis} selectedIndex={selectedAbiIndex} handleChange={handleChange} />
        <ParameterInput
          abis={abis}
          selectedAbiIndex={selectedAbiIndex}
          handleNewParams={handleNewParams}
          parameters={parameters}
          paramsValid={paramsValid}
        />
        <TextField
          label={t('Target Contract Address')}
          variant='outlined'
          fullWidth
          value={target}
          onChange={(ev) => setTarget(ev.target.value)}
          InputProps={{
            endAdornment: (
              <>
                <InputAdornment position='end'>
                  <AddressBook onResult={setTarget} />
                </InputAdornment>
              </>
            )
          }}
        />

        <ButtonGroup fullWidth variant='outlined' sx={{ mt: 2 }}>
          <Button color='info' onClick={() => addOperation()}>
            {t('Add Operation')}
          </Button>
          <Button onClick={() => resetTempOperation()}>
            {t('Reset Operation')}
          </Button>
        </ButtonGroup>

        <DrawOperations />
        <Divider />

        <Typography id='proposal-description-editor' variant='h4' align='left' sx={{ mb: 2 }}>
          {t('Proposal Description').toUpperCase()}
        </Typography>

        <ProposalEditor />
        {error && (
          <>
            <Alert color='error' sx={{ mt: 2 }}>
              {error.message}
            </Alert>
            <Divider />
          </>
        )}
        <Anchor name='editor-buttons' />
        <ButtonGroup variant='outlined' sx={{ mt: 2 }}>
          <Button color='success' onClick={editor.createProposal}>
            {t('Propose')}
          </Button>
          {editor.state.operations && editor.state.operations.length > 0}{' '}
          <Button onClick={editor.generateDescription}>{t('Append information')}</Button>
          <Button onClick={reset}>{t('Reset')}</Button>
          <Button onClick={closeEditor}>{t('Close')}</Button>
        </ButtonGroup>
      </SxCard>
    </>
  )
}

export default CreateProposal
