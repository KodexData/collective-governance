# collective-governance/playground
The Collective Governance Contract Suite is a fully decentralized on-chain voting environment built using [OpenZeppelin Contracts](https://www.openzeppelin.com/contracts). It enables the creation and management of [DAOs](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) operating on any compatible EVM network.

This simple user interface demonstrates the governance contracts using [React](https://react.dev), [MUI](https://mui.com), [window.ethereum](https://docs.metamask.io/guide/ethereum-provider.html/) and [ethers.js](https://docs.ethers.org/v5).

To run in development mode run `npm run dev` or `yarn dev`.

## static build

To add an asset prefix edit `package.homepage` or add an `.env` file:
```bash
HOMEPAGE=https://myserver.com/governance
```

Run `npm run build` or `yarn build` to create the `dist` folder. 
