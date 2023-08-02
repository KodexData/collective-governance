import type { RoleGrantedEvent, RoleRevokedEvent } from '../typechain-types/AccessControl'
import type { TimelockController } from '../typechain-types'
import type * as T from './types'

export { ADDRESS_ZERO, printEvents } from '@kodex-data/testing'

export function findRole<T extends Record<string, string>>(role: string, record: T) {
  for (const roleName in record) {
    const k = roleName as keyof typeof record
    if (record[k] === role) {
      return roleName
    }
  }
}

export async function getRoles(timelock: TimelockController) {
  return {
    TIMELOCK_ADMIN_ROLE: await timelock.TIMELOCK_ADMIN_ROLE(),
    DEFAULT_ADMIN_ROLE: await timelock.DEFAULT_ADMIN_ROLE(),
    CANCELLER_ROLE: await timelock.CANCELLER_ROLE(),
    EXECUTOR_ROLE: await timelock.EXECUTOR_ROLE(),
    PROPOSER_ROLE: await timelock.PROPOSER_ROLE()
  }
}

export async function getRoleGranted(timelock: TimelockController) {
  const filter = timelock.filters.RoleGranted()
  return await timelock.queryFilter(filter)
}

export async function getRoleRevoked(timelock: TimelockController) {
  const filter = timelock.filters.RoleRevoked()
  return await timelock.queryFilter(filter)
}

export function parseEvents(logs: (RoleGrantedEvent | RoleRevokedEvent)[], roles: Record<string, string>): T.UserRole[] {
  return logs
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .map((l) => {
      const { role, sender, account } = l.args || {}
      const roleName = findRole(role, roles)
      return { role, sender, account, hash: l.transactionHash, blockNumber: l.blockNumber, roleName }
    })
}

export function isERC20(bytecode: string) {
  const sigs = [
    '06fdde03',
    '95d89b41',
    '313ce567',
    '18160ddd',
    '70a08231',
    'dd62ed3e',
    'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  ]

  return (
    sigs.length ===
    sigs.reduce((a, signature) => {
      if (bytecode.includes(signature)) a++
      return a
    }, 0)
  )
}

export function isTimelock(bytecode: string): boolean {
  let found = 0

  const required = [
    'b1c5f427', // b1c5f427  =>  hashOperationBatch(address[],uint256[],bytes[],bytes32,bytes32)
    'f27a0c92', // f27a0c92  =>  getMinDelay()
    '2ab0f529', // 2ab0f529  =>  isOperationDone(bytes32)
    'e38335e5' // e38335e5  =>  executeBatch(address[],uint256[],bytes[],bytes32,bytes32)
  ].map((signature) => {
    if (bytecode.includes(signature)) found++
    return signature
  })

  return found === required.length
}
