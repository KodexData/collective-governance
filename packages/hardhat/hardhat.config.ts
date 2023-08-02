import type { HardhatUserConfig } from 'hardhat/config'
import { getNetwork, getAccounts } from '@kodex-data/testing'
import { config } from 'dotenv'
import '@kodex-data/prototypes'
import 'hardhat-ignore-warnings'
import '@openzeppelin/hardhat-upgrades'
import '@nomicfoundation/hardhat-toolbox'
import '@kodex-data/flat-zeppelin'
import 'hardhat-docgen'
import 'hardhat-gas-reporter'
import './tasks'

config()

export default <HardhatUserConfig>{
  defaultNetwork: getNetwork(),
  warnings: 'off',
  flatZeppelin: {
    license: 'MIT'
  },
  networks: {
    hardhat: {
      blockGasLimit: 114000000,
      chainId: 31337
    },
    localhost: {
      blockGasLimit: 64000000,
      url: 'http://0.0.0.0:8545',
      chainId: 31337
    },
    milkomedaMainnet: {
      blockGasLimit: 64000000,
      url: 'https://rpc-mainnet-cardano-evm.c1.milkomeda.com',
      accounts: getAccounts(),
      chainId: 2001
    },
    milkomedaTestnet: {
      blockGasLimit: 64000000,
      url: 'https://rpc-devnet-cardano-evm.c1.milkomeda.com',
      accounts: getAccounts(),
      chainId: 200101
    },
    phxDev: {
      blockGasLimit: 128000000,
      url: 'http://0.0.0.0:8556',
      chainId: 4669,
      accounts: getAccounts()
    },
    classic: {
      blockGasLimit: 8000000,
      url: 'https://ethercluster.com/etc',
      chainId: 61,
      accounts: process.env.PRIVATE_KEY_MAINNET ? [process.env.PRIVATE_KEY_MAINNET] : []
    },
    atagoTestnet: {
      blockGasLimit: 8000000,
      url: 'https://faucet.sidechain.evmtestnet.iohkdev.io/ ',
      chainId: 78,
      accounts: getAccounts()
    }
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    noColors: true
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: false
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  }
}
