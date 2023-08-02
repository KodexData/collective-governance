import { parseUnits } from '@ethersproject/units'

export const DEPLOY_DEFAULTS = {
  tokenName: 'DAO Token',
  tokenSymbol: 'DAT',
  preMint: parseUnits('100', 18),
  votingPeriod: 50400 /* 1 week */,
  minDelay: 10
}
