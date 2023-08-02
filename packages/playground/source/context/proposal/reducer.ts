import type { Reducer } from 'react'
import type { NewProposalState, NewProposalActions } from './types'
import { id } from '@ethersproject/hash'
import initialState from './initial'

const reducer: Reducer<NewProposalState, NewProposalActions> = (state, action): NewProposalState => {
  let _state: NewProposalState = { ...state }
  let forceDump = false

  switch (action.type) {
    case 'set-state':
      _state = { ..._state, ...action.payload }
      break
    case 'reset-proposal':
      _state = initialState
      break
    case 'set-description':
      _state.description = action.payload
      _state.descriptionId = id(action.payload)
      break
    case 'add-operation':
      _state.operations = [..._state.operations, action.payload]
      break
    case 'remove-operation':
      delete _state.operations[action.index]
      break
  }

  return _state
}

export default reducer
