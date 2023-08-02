import { config } from 'dotenv'

config()

export const TASK_DEPLOY_DAO = 'deploy-dao'
export const TASK_DEPLOY_TIMELOCK = 'deploy-timelock'
export const TASK_DEPLOY_DAO_TOKEN = 'deploy-dao-token'
export const TASK_DEPLOY_DAO_WRAPPED = 'deploy-dao-wrapped'
export const TASK_DEPLOY_TREASURY = 'deploy-treasury'
export const TASK_DEPLOY_FACTORY = 'deploy-factory'
export const TASK_DEPLOY_ERC20 = 'deploy-erc20'
export const TASK_DEPLOY_DAO_REGISTRY = 'deploy-dao-registry'
export const TASK_DEPLOY_MULTICALL2 = 'deploy-multicall2'
export const TASK_LIST_OWNERSHIP = 'list-ownership'

export const ROLES = {
  TIMELOCK_ADMIN_ROLE: '0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5',
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
  CANCELLER_ROLE: '0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783',
  EXECUTOR_ROLE: '0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63',
  PROPOSER_ROLE: '0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1'
}

export const { GOVERNOR } = process.env
