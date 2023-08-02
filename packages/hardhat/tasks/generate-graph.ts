import { task } from 'hardhat/config'
import { run } from 'hardhat'

task('generate-graph', 'generate a new subgraph for a given contract')
  .addParam('address', 'deployed contract address')
  .addParam('contractName', 'contract name')
  .addOptionalParam('subtask', 'init | update | add')
  .setAction(async ({ contractName, address, subtask }) => {
    if (subtask) run('graph', { contractName, address, subtask })
    else {
      run('graph', { contractName, address })
    }
  })
