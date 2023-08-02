import type { Operation } from '@collective-governance/api-evm'

export interface NewProposalState {
  descriptionId: string
  description: string
  operations: Operation[]
  errors: Error[]
}

export type NewProposalActions =
  | { type: 'set-state'; payload: Partial<NewProposalState> }
  | { type: 'reset-proposal'; payload?: boolean }
  | { type: 'reset-operations'; payload?: boolean }
  | { type: 'add-operation'; payload: Operation }
  | { type: 'remove-operation'; index: number }
  | { type: 'add-error'; payload: Error }
  | { type: 'set-description'; payload: string }
  | { type: 'set-description-id'; payload: string }
