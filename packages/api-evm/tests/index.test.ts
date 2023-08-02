import '@kodex-data/testing'
import { QueryApi } from '../source'
import { WebSocketProvider } from '@ethersproject/providers'
import { expect } from 'chai'
import logger from 'mocha-logger'

describe('testing @collective-governance/api-evm', function () {
  const provider = new WebSocketProvider(`ws://0.0.0.0:8557`)
  const queryApi = new QueryApi()
  const governor = '0x7FBCf71492e8f862F80e2aB682DA7584cd5ba452'

  it('should query transactions from node', async function () {
    const addresses = await queryApi.initialize({ governor, provider })

    logger.success(`governor: ${addresses.governor}`)
    logger.success(`dao token: ${addresses.token}`)
    logger.success(`timelock: ${addresses.timelock}`)
    logger.success(`treasury: ${addresses.treasury}`)

    expect(addresses.governor.isAddress()).true
    expect(addresses.governor).equals(governor)
  })

  it('should query required logs', async function () {
    const { comment, created, voteCast } = await queryApi.queryLogs()
    expect(Array.isArray(comment)).true
    expect(Array.isArray(created)).true
    expect(Array.isArray(voteCast)).true
  })

  it('should get event stats', async function () {
    const stats = queryApi.getEventStats()
    console.log(stats)
  })
})
