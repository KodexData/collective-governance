import type * as T from './types'
import * as TASKS from './constants'
import * as helpers from './helpers'
import fs from 'fs-extra'
import { task } from 'hardhat/config'
import logger from 'mocha-logger'
import colorize from 'json-colorizer'

async function ownershipReport(address: string, ethers: T.Ethers) {
  const governance = await ethers.getContractAt('Governance', address)
  const timelockAddress = await governance.timelock()
  const tokenAddress = await governance.token()

  const token = await ethers.getContractAt('DaoToken', tokenAddress)
  const timelock = await ethers.getContractAt('TimelockController', timelockAddress)

  const roles = TASKS.ROLES || (await helpers.getRoles(timelock))
  const grants = await helpers.getRoleGranted(timelock)
  const revokes = await helpers.getRoleRevoked(timelock)

  const logs = grants.reduce((acc, gr) => {
    const { role, account } = gr.args

    // ignore when revoked.
    if (revokes.find(({ args }) => args.account === account && args.role === role)) {
      return acc
    }

    return [...acc, gr]
  }, [] as typeof grants)

  const result: T.ListOwnershipResult = {
    token: {
      address: tokenAddress,
      owner: await token.owner()
    },
    governance: {
      address,
      timelock: timelockAddress,
      tokenAddress: tokenAddress
    },
    timelock: {
      address: timelockAddress,
      granted: helpers.parseEvents(logs, roles),
      revoked: helpers.parseEvents(revokes, roles),
      users: {}
    },
    roles
  }

  for (const user of result.timelock.granted) {
    if (!result.timelock.users[user.account]) {
      result.timelock.users[user.account] = [user.roleName!]
      continue
    }

    if (!result.timelock.users[user.account].includes(user.roleName!)) {
      result.timelock.users[user.account].push(user.roleName!)
    }
  }

  return result
}

task(TASKS.TASK_LIST_OWNERSHIP, 'Lists all owner and access control infos from governance contract')
  .addParam('address', 'governor contract address to inspect')
  .addOptionalParam('output', 'output json file')
  .setAction(async ({ address, output }: T.ListOwnershipParams, { ethers }) => {
    if (!address || !address.isAddress()) throw new Error(`invalid contract address: ${address}`)

    const result = await ownershipReport(address, ethers)
    if (typeof output === 'string') {
      logger.success(`writing result to:`, output)
      await fs.writeJSON(output, result, { spaces: 2 })
    }

    console.log(colorize(JSON.stringify(result, null, 2)))
    logger.success(`process done`)

    return result
  })
