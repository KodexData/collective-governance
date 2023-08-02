import type { Reducer } from 'react'
import type { State, StateActions } from './types'
import { saveCachedState } from './cache'
import { mergeProposal } from '@collective-governance/api-evm'
import { BigNumber } from '@ethersproject/bignumber'
import { isEmpty } from 'lodash'
import initial from './initial'

const reducer: Reducer<State, StateActions> = (previousState, action): State => {
  let nextState: State = { ...previousState }
  let forceDump = false

  switch (action.type) {
    case 'reset':
      return initial
    case 'save-state':
      forceDump = true
      break
    case 'log-state':
      console.log(nextState)
      break
    case 'logout':
      return { ...initial, loggedOut: true }
    case 'set-all':
      nextState = action.payload
      nextState.proposalStateHash = JSON.stringify(nextState.proposals).toSha3()
      break
    case 'set-hide-sidebar':
      nextState.hideSidebar = action.payload
      break
    case 'set-is-loading':
      nextState.isLoading = action.payload
      break
    case 'set-is-initialized':
      nextState.isInitialized = action.payload
      break
    case 'set-editor-open':
      nextState.editorOpen = action.payload
      break
    case 'toggle-sidebar':
      nextState.hideSidebar = !nextState.hideSidebar
      break
    case 'set-chain-id':
      nextState.chainId = action.payload
      break
    case 'set-dc':
      nextState.contracts.DaoRegistry = action.payload
      break
    case 'set-delegators':
      nextState.delegators = action.payload
      break
    case 'set-governor':
      nextState.contracts.Governance = action.payload
      break
    case 'set-timelock':
      nextState.contracts.TimelockController = action.payload
      break
    case 'set-treasury':
      nextState.contracts.Treasury = action.payload
      break
    case 'set-dao-token':
      nextState.contracts.DaoToken = action.payload
      break
    case 'set-proposal-threshold':
      if (nextState.governorInformation) nextState.governorInformation.proposalThreshold = action.payload
      break
    case 'set-voting-delay':
      if (nextState.governorInformation) nextState.governorInformation.votingDelay = action.payload
      break
    case 'set-voting-period':
      if (nextState.governorInformation) nextState.governorInformation.votingPeriod = action.payload
      break
    case 'set-numerator':
      if (nextState.governorInformation) nextState.governorInformation.numerator = action.payload
      break
    case 'update-proposal':
      if (action.payload.id) {
        const oldProp = nextState.proposals[action.payload.id]
        nextState.proposals[action.payload.id] = mergeProposal(oldProp, action.payload)

        if (!isEmpty(nextState.proposals)) forceDump = true
        nextState.proposalStateHash = JSON.stringify(nextState.proposals).toSha3()
      }

      break
    case 'set-proposals':
      // when proposals in local state are greater then in the payload, we can assume that this payload
      // only contains a fraction of all proposals through quick updates.
      if (!isEmpty(previousState.proposals) && Object.keys(previousState.proposals).length > Object.keys(action.payload).length) {
        nextState.proposals = { ...previousState.proposals, ...action.payload }
      } else {
        nextState.proposals = action.payload
      }
      
      if (!isEmpty(nextState.proposals)) forceDump = true
      nextState.proposalStateHash = JSON.stringify(nextState.proposals).toSha3()
      break
    case 'set-user-roles':
      nextState.userRoles = action.payload
      break
    case 'set-token-info':
      nextState.tokenInfo = { ...nextState.tokenInfo, ...action.payload }
      if (action.payload.treasury) {
        nextState.contracts.Treasury = action.payload.treasury
      }
      break
    case 'add-error':
      nextState.errors = [action.payload, ...nextState.errors]
      break
    case 'add-receipt':
      nextState.receipts = [action.payload, ...nextState.receipts]
      break
    case 'set-quorum':
      if (action.payload instanceof BigNumber) {
        action.payload = action.payload.toString()
      }
      nextState.quorum = action.payload
      break
    case 'remove-error':
      // _state.errors = _state.errors.reduce<Error[]>((acc, curr, index) => {             
      //   if (index !== action.index) acc.push(curr)
      //   return acc
      // }, [])
      nextState.errors = nextState.errors.filter((_, index) => index !== action.index)
      break
    case 'set-delegation':
      nextState.delegation = action.payload
      break
    case 'set-treasury-balances':
      nextState.treasuryBalances = action.payload
      break
    case 'set-governor-information':
      nextState.governorInformation = action.payload
      break
    case 'set-timelock-information':
      nextState.timelockInformation = action.payload
      break
    case 'set-abi-graph-url':
      nextState.abiGraphUrl = action.payload
      break
    case 'set-is-app-ready':
      nextState.isAppReady = action.payload
      break
    case 'search/set-open':
      nextState.searchOpen = action.payload
      break
    case 'set-dao-register':
      nextState.daoRegister = action.payload
      break
    case 'set-hide-wallet-information-box':
      nextState.hideWalletInformationBox = action.payload
      break
    case 'set-delegate-open':
      nextState.delegateOpen = action.payload
      forceDump = true
      break
  }

  if (forceDump === true) {
    saveCachedState(nextState)
    nextState.lastStateDump = new Date().valueOf()
  }

  nextState.lastStateUpdate = new Date().valueOf()

  return nextState
}

export default reducer
