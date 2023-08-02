# Collective Governance Contract Suite

Collective Governance is a suite of smart contracts that enables communities to make collective decisions in a transparent and democratic way. Built on the Ethereum Virtual Machine (EVM) and utilizing the powerful OpenZeppelin contract libraries, Collective Governance provides a secure and reliable platform for decentralized decision-making.

run `make all` or `yarn build` to install yarn workspace.

## Deploy a DAO

modify `.env` file in root folder and apply your settings. if you need to add an own network head over to `packages/hardhat/hardhat.config.ts` and add your desired network there.

__hardhat config extension example:__

```ts
export default <HardhatUserConfig>{
  defaultNetwork: 'hardhat',
  warnings: 'off',
  networks: {
    myNetwork: {
      blockGasLimit: 128000000,
      url: 'http://0.0.0.0:8559',
      chainId: 4669,
      accounts: getAccounts()
    },
    // ...
  },
  // ...
}
```

__env file example:__

```bash
NETWORK=myNetwork
NAME=Kodex DAO
SYMBOL=KDQX
PURPOSE=testing voting mode quorum=for-against&succeed=for>against
```

you also have to create a new env file in `packages/hardhat/.env`:

```bash
PRIVATE_KEY_MAINNET=eb...
PRIVATE_KEY=f06...
```

when this steps are applied run

- `make deploy-dao`

__example output:__

```bash
newuser@MB18-2 collective-governance-suite % make deploy-dao
cd packages/hardhat && npx hardhat --network phxDev deploy-dao --name 'Kodex Initial DAO' --symbol 'KDI' --purpose 'testing voting mode quorum=for-against&succeed=for>against'
    ✔ network: unknown - chainId: 4669
    ✔ USING DEPLOYER ADDRESS: 0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61
    ✔ DaoToken: Kodex Initial DAO contract deployed to: 0x21540074Ac4c37da80BAC3E6674E10a2242fc2B4 - owner: 0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61 - chainId: 4669 - tx: 0xc1be67595e55ed7dee825c9fa756b7d2da90ccec49e4ccf39665a6f0568d237c
    ✔ Timelock: 0x5B402970b7425d284213eF9308b1316770b554d0 - tx: 0xa6ef49218624101f4df02cb1d05a442d04c0d8dae601a0f46f134a9bc544c8c9
    ✔ DAO Treasury contract deployed to: 0x61cc56140Ebec8f3aE895711702Ffa87eba8502D - chainId: 4669 - tx: 0x2c47a0b59abbbf5c39ee6b73fcdc91e434688ea7f2edd4427e6127c611ae5faa
    ✔ Governance: 0xBBd0AeC7527d1beD439C94DE4b11b0298177097B - tx: 0x76cbbf5f6e26db7b0877bd98af2bfe29101f54fec4bef8085324333067245be3
    ✔ Treasury: 0x61cc56140Ebec8f3aE895711702Ffa87eba8502D - tx: 0x2c47a0b59abbbf5c39ee6b73fcdc91e434688ea7f2edd4427e6127c611ae5faa
    ✔ TreasuryChanged (GAS: 45887) ["0x0000000000000000000000000000000000000000","0x61cc56140Ebec8f3aE895711702Ffa87eba8502D"]
    ✔ RoleGranted (GAS: 94196) ["0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1","0xBBd0AeC7527d1beD439C94DE4b11b0298177097B","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61"]
    ✔ RoleGranted (GAS: 142505) ["0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61"]
    ✔ RoleGranted (GAS: 190814) ["0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5","0xBBd0AeC7527d1beD439C94DE4b11b0298177097B","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61"]
    ✔ RoleGranted (GAS: 239123) ["0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61"]
    ✔ RoleRevoked (GAS: 18200) ["0x5f58e3a2316349923ce3780f8d587db2d72378aed66a8261c916544fa6846ca5","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61","0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61"]
    ✔ OwnershipTransferred (GAS: 48378) ["0x2c6b649Cf99B68A5C6092b2a67e4Bc17a9B33F61","0x5B402970b7425d284213eF9308b1316770b554d0"]
    ✔ process done
```

## deploy multicall

its highly recommended to use multicall2 contracts to speed up query speed and lower request rate (infura). if your chain does not have multicall2 deployed you can run `make deploy-multicall2`, then head over to `packages/playground/source/config.ts` and add your multicall2 contract address:

```ts
export const CHAIN_ID = 4669
export const MULTICALL_ADDRESS = '0xAb85F66f2f512E3576a31e810ff30451Cc4e2e7b'

export const multicallContracts: MulticallContract[] = [
  // replace or add object
  { chainId: CHAIN_ID, address: MULTICALL_ADDRESS },
]
```

default exported multicall addresses:

```ts
[
  [1, '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441'],     // Ethereum Mainnet
  [3, '0x53C43764255c17BD724F74c4eF150724AC50a3ed'],     // Ropsten Testnet
  [4, '0x42Ad527de7d4e9d9d011aC45B31D8551f8Fe9821'],     // Rinkeby Testnet
  [5, '0x77dCa2C955b15e9dE4dbBCf1246B4B85b651e50e'],     // Goerli Testnet
  [42, '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6'],    // Kovan Testnet
  [56, '0xC3821F0b56FA4F4794d5d760f94B812DE261361B'],    // Binance Smart Chain (BSC)
  [61, '0x2bAADf55fB2177e8d13708a7f09B966f671555Eb'],    // BSC Testnet
  [100, '0xB5A6F04357Bfd9A21A8C2D32EE37e08b1BD587F6'],   // xDai Chain
  [250, '0x3E3D6b13E6cC2B159c7bE64e6C87BD2c3E26F3F8'],   // Fantom Opera
  [43114, '0xB828C456Fc39AA2370A621AcE52Dc84bEA08ab58'], // Avalanche
  [42161, '0x2Ba4C95Ce2d00cE39eAa4Fb50f19024A53c73EF2'], // Arbitrum
  [10, '0x8D6591F594a5ee3A7AFFf03E6e24b6B866792575'],    // Optimism
  [2001, '0x18fA376d92511Dd04090566AB6144847c03557d8'],
  [78, '0xa83A64E9a4aFa9378C49d17400836D402145f7a2'],
  [200101, '0xBBa0649cb8A6dcf69bc66bd6c5e0950C64F3c724'],
]
```

## Start React Playground

- run `yarn start` or `yarn workspace @collective-governance/playground dev`

to build the homepage it is required to change the `HOMEPAGE` option in `packages/playground/.env` file to your desired homepage url.