import type { State, StateActions } from './types'
import type { Proposal, ProposalStatus } from '@collective-governance/api-evm'

import { createContext, useReducer } from 'react'
import reducer from './reducer'
import initial from './initial'
import { BigNumber } from '@ethersproject/bignumber'

export interface StateContext {
  state: State
  dispatch: React.Dispatch<StateActions>

  getProposals(states?: ProposalStatus[] | ProposalStatus): Proposal[]
  getActiveProposals(): Proposal[]
  isActiveProposal(id: string | BigNumber): boolean
}

interface StateProviderProps {
  children: React.ReactNode
}

export const CtxState = createContext({} as StateContext)

const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initial)

  function getProposals(states?: ProposalStatus[] | ProposalStatus): Proposal[] {
    if (typeof states === 'undefined') states = []
    if (!Array.isArray(states)) states = [states]

    const filterStates = [...states]
    const allProposals = Object.values(state.proposals).sort((a, b) => b.blockNumber - a.blockNumber)
    
    if (filterStates.length === 0) return allProposals
    else return allProposals.filter((proposal) => filterStates.includes(proposal.status))
  }

  function getActiveProposals() {
    return getProposals([0,1,4,5,6])
  }

  function isActiveProposal(id: string | BigNumber): boolean {
    if (id instanceof BigNumber) id = id.toString()
    if (!state.proposals[id]) return false
    return [1,4,5,6].includes(state.proposals[id].status)
  }

  return (
    <CtxState.Provider
      value={{
        state,
        dispatch,
        getProposals,
        isActiveProposal,
        getActiveProposals
      }}
    >
      {children}
    </CtxState.Provider>
  )
}

export default StateProvider
