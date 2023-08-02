import type * as T from '@collective-governance/api-evm'
import type { NewProposalState, NewProposalActions } from './types'
import type { ParamType } from '@ethersproject/abi'
import { createContext, useContext, useReducer } from 'react'
import { DaoToken__factory } from '@collective-governance/hardhat'
import { CtxEthers } from '@kodex-react/ctx-ethers'
import { useForceUpdate } from 'hooks'
import { CtxGovernance } from 'context/governance'
import { useSnackbar } from 'notistack'
import { Contract } from '@ethersproject/contracts'

import reducer from './reducer'
import initial from './initial'

export interface NewProposalContext {
  state: NewProposalState
  dispatch: React.Dispatch<NewProposalActions>

  toSignature(abi: T.FunctionFragment): string
  addOperation(operation: Omit<T.Operation, 'callData' | 'signature'>): Promise<void>
  verifyParams(operation: Pick<T.Operation, 'abi' | 'parameters'>): boolean
  isOwnedMintToken(contractAddress: string): Promise<false | T.TknInfo>
  isOwnedNftMintToken(contractAddress: string): Promise<false | T.TknInfo>
  createProposal(): Promise<void>
  generateDescription: () => string
}

interface PrNewProposalProviderProps {
  children: React.ReactNode
}

export const CtxProposal = createContext({} as NewProposalContext)

const NewProposalProvider: React.FC<PrNewProposalProviderProps> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar()
  const ethers = useContext(CtxEthers)
  const governance = useContext(CtxGovernance)
  const [state, dispatch] = useReducer(reducer, initial)
  const update = useForceUpdate()
  
  function toSignature(abi: T.FunctionFragment) {
    return `${abi.name}(${abi.inputs.map((x) => x.type).join(',')})`
  }

  function verifyParams(operation: Pick<T.Operation, 'abi' | 'parameters'>): boolean {
    const {
      abi: { inputs },
      parameters
    } = operation

    if (!inputs || inputs.length === 0) return true
    if (inputs.length !== Object.keys(parameters).length) return false

    let valid = false
    inputs.map((input, i) => {
      const candidate: string | undefined = parameters[i]

      if (typeof candidate === 'string')
        switch (input.type) {
          case 'address':
            if (!candidate.isAddress()) {
              valid = false
            } else {
              valid = true
            }
            break
          case 'address[]':
            for (const address of candidate.split(',')) {
              if (!address.isAddress()) {
                valid = false
              } else {
                valid = true
              }
            }
            break
          case 'string':
            if (typeof candidate !== 'string' || candidate.length === 0) {
              valid = false
            } else {
              valid = true
            }
            break
          default:
            if (input.type.includes('uint')) {
              if (!String(candidate).isNumber()) {
                valid = false
              } else {
                valid = true
              }
            }
        }
    })

    return valid
  }

  async function addOperation(operation: T.Operation) {
    operation.signature = toSignature(operation.abi)
    operation.signature.toSha3().slice(0, 10)
    operation = createCallData(operation)
    dispatch({ type: 'add-operation', payload: operation })
  }

  function createCallData(operation: T.Operation): T.Operation {
    const { target, parameters, abi } = operation

    try {
      const { interface: iface } = new Contract(target, [abi])
      const params: any[] = []

      for (const key of Object.keys(parameters)) {
        const param = parameters[Number(key)]
        const paramType: ParamType['type'] = abi.inputs[Number(key)]['type']

        if (paramType.endsWith('[]')) {
          params[Number(key)] = param.split(',')
        } else {
          params[Number(key)] = param
        }
      }

      operation.callData = iface.encodeFunctionData(abi.name, params)
    } catch (error) {
      if (error instanceof Error) {
        dispatch({ type: 'add-error', payload: error })
      }
    }

    return operation
  }

  async function createProposal() {
    if (state.operations.length === 0) {
      enqueueSnackbar(`no operations, can not create proposal`, { variant: 'warning' })
      return
    }

    if (!state.description || state.description === '') {
      enqueueSnackbar(`no description provided, can not create proposal`, { variant: 'warning' })
      return
    }

    const { operations, description } = state
    const targets: string[] = []
    const values: any[] = []
    const callDatas: string[] = []

    for (const operation of operations) {
      if (!operation) continue
      if (!operation.callData) {
        throw new Error(`invalid callData provided, can not create proposal`)
      }
      targets.push(operation.target)
      values.push(operation.value || 0)
      callDatas.push(operation.callData)
    }

    const errored = await governance.propose([targets, values, callDatas, description])
    if (!errored) dispatch({ type: 'reset-proposal' })
    update()
  }

  const generateDescription = () => {
    let description: string = state.description || ''

    if (state.operations && state.operations.length > 0) {
      for (const operation of state.operations) {
        if (!operation || !operation.parameters) continue
        const params = Object.values(operation.parameters)
        description += `\n\n---\n`
        description += `\n__OPERATION__:\n\n`
        description += `\n- METHOD: ${operation.signature}`
        description += `\n- PARAMS: ${params.join(', ')}`
        description += `\n\n__ABI__: \n\n`
        description += "```json\n" + JSON.stringify(operation.abi, null, 2) + "\n```"
      }
    }

    dispatch({ type: 'set-description', payload: description })
    return description
  }

  async function isOwnedMintToken(contractAddress: string) {
    if (!ethers.provider || !governance.api._timelock.address) return false
    const bytecode = await ethers.provider.getCode(contractAddress)
    // check if bytecode has owner() `8da5cb5b` and mint() `40c10f19` method.
    if (bytecode === '0x' || !bytecode.includes('40c10f19') || !bytecode.includes('8da5cb5b')) {
      enqueueSnackbar(`given address is not compatible`, { variant: 'error' })
      return false
    }
    try {
      const contract = DaoToken__factory.connect(contractAddress, ethers.provider)
      const owner = await contract.owner()
      if (!owner.addrIsEqual(governance.api._timelock.address)) {
        enqueueSnackbar(`contract is not owned by governor`, { variant: 'error' })
        return false
      }

      return {
        name: await contract.name(),
        symbol: await contract.symbol(),
        decimals: await contract.decimals(),
        totalSupply: await contract.totalSupply().then(n => n.toString())
      } as T.TknInfo

    } catch (error) {
      const { message } = error as { message: string }
      enqueueSnackbar(`${message}`, { variant: 'error' })
      return false
    }
  }

  async function isOwnedNftMintToken(contractAddress: string) {
    if (!ethers.provider || !governance.api._timelock.address) return false
    const bytecode = await ethers.provider.getCode(contractAddress)
    // check if bytecode has owner() `8da5cb5b` and safeMint(address,string) `d204c45e` method.
    if (bytecode === '0x' || !bytecode.includes('d204c45e') || !bytecode.includes('8da5cb5b')) {
      enqueueSnackbar(`given address is not compatible`, { variant: 'error' })
      return false
    }
    try {
      const contract = DaoToken__factory.connect(contractAddress, ethers.provider)
      const owner = await contract.owner()
      if (!owner.addrIsEqual(governance.api._timelock.address)) {
        enqueueSnackbar(`contract is not owned by governor`, { variant: 'error' })
        return false
      }

      return {
        name: await contract.name(),
        symbol: await contract.symbol(),
        decimals: 0,
        totalSupply: '0'
      } as T.TknInfo

    } catch (error) {
      const { message } = error as { message: string }
      enqueueSnackbar(`${message}`, { variant: 'error' })
      return false
    }
  }

  return (
    <CtxProposal.Provider
      value={{
        state,
        dispatch,
        addOperation,
        verifyParams,
        toSignature,
        createProposal,
        generateDescription,
        isOwnedMintToken,
        isOwnedNftMintToken,
      }}
    >
      {children}
    </CtxProposal.Provider>
  )
}

export default NewProposalProvider
