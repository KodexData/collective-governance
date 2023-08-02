import { useEffect, useState } from 'react'
import { useChainIdNetwork, useApplication } from 'hooks'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import SxBox from 'components/customs/SxBox'
import TextField from '@mui/material/TextField'

interface SwitchChainProps {
  chainId?: number
  description?: string
}

const SwitchChain: React.FC<SwitchChainProps> = (props) => {
  const [chainName, setChainName] = useState<string>('')
  const [chainId, setChainId] = useState<string>(String(props.chainId))
  const [rpcUrl, setRpcUrl] = useState<string>('')
  const [iconUrl, setIconUrl] = useState<string>('')
  const [explorerUrl, setExplorerUrl] = useState<string>('')
  const { ethers: { switchChain, addChain, state } } = useApplication()
  const { result, isLoaded, findChain } = useChainIdNetwork(chainId)  

  function toChainName (chain: number | undefined) {
    if (!result || !isLoaded) return
    return findChain(chainId)?.chainName
  }

  useEffect(() => {
    if (!result) return
    if (result.chainId) setChainId(parseInt(result.chainId).toString())
    if (result.chainName) setChainName(result.chainName)
    if (result.rpcUrls) setRpcUrl(result.rpcUrls[0])
    if (result.iconUrls) setIconUrl(result.iconUrls[0])
    if (result.blockExplorerUrls) setExplorerUrl(result.blockExplorerUrls[0])
  }, [isLoaded, result])

  return (
    <>
      <SxBox sx={{ maxWidth: '100%' }}>
        <Typography variant='h6' gutterBottom sx={{ mb: 2 }}>
          chain switch to chainId <b>{toChainName(props.chainId)}</b> requested (id: {props.chainId})<br />
          <Typography variant='caption'></Typography>
        </Typography>
        <Divider />
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          label={`Chain Name`}
          placeholder='please enter valid chain name'
          value={chainName}
          onChange={(ev) => setChainName(ev.target.value)}
        />
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          label={`Chain Identifier: ${Number(chainId).toHex()}`}
          placeholder='please enter desired chainId'
          value={chainId}
          onChange={(ev) => setChainId(ev.target.value)}
        />
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          label='Provider Url'
          placeholder='please enter valid provider url'
          value={rpcUrl}
          onChange={(ev) => setRpcUrl(ev.target.value)}
        />
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          label='Block Explorer Url'
          placeholder='please enter valid block explorer url'
          value={explorerUrl}
          onChange={(ev) => setExplorerUrl(ev.target.value)}
        />
        <TextField
          fullWidth
          variant='outlined'
          size='small'
          label='Icon Url'
          placeholder='please enter valid icon url'
          value={iconUrl}
          onChange={(ev) => setIconUrl(ev.target.value)}
        />

        <Divider />

        <ButtonGroup variant='text' fullWidth>
          <Button
            color='success'
            onClick={async () => {
              switchChain(Number(chainId)).catch((error) => {
                if (error['message'].includes('Unrecognized chain ID')) {
                  if (result) addChain(result as AddEthereumChainParameter)
                }
              })
            }}
          >
            Change Network
          </Button>
          <Button
            color='warning'
            onClick={async () => {
              if (result) addChain(result as AddEthereumChainParameter)
            }}
          >
            Add Network
          </Button>
        </ButtonGroup>
      </SxBox>
    </>
  )
}

export default SwitchChain
