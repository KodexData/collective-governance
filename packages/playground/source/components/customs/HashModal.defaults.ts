
export interface DefaultHash {
  label: string
  type: 'topic' | 'role'
  hash: string
}

const defaults: DefaultHash[] = [
  { hash: '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5', label: 'TIMELOCK_ADMIN_ROLE', type: 'role' },
  { hash: '0x0000000000000000000000000000000000000000000000000000000000000000', label: 'DEFAULT_ADMIN_ROLE', type: 'role' },
  { hash: '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783', label: 'CANCELLER_ROLE', type: 'role' },
  { hash: '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63', label: 'EXECUTOR_ROLE', type: 'role' },
  { hash: '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1', label: 'PROPOSER_ROLE', type: 'role' },
]

export default defaults