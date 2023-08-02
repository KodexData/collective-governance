# Collective Governance Contract Suite Documentation

The Collective Governance Contract Suite is a fully decentralized on-chain voting environment built using [OpenZeppelin Contracts](https://www.openzeppelin.com/contracts). It enables the creation and management of [DAOs](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization) operating on any compatible EVM network.

## Building Collective Governance

To build Collective Governance, you can use the following commands:

- `npm run build` or `yarn build`: This command will compile contracts, generate typechain-types and rollup the types.

### Main Contracts

The following are the main contracts used in the Collective Governance Contract Suite:

#### `DaoRegistry.sol`

This contract is responsible for registering and updating the status of DAOs operating in the Collective Governance ecosystem.

#### `DaoToken.sol` / `DaoWrapped.sol`

These contracts create the administration token required to add or remove DAOs from the Collective Governance registry.

#### `Governance.sol` (+`TimeLockController.sol`)

This contract provides the governance functionality, allowing DAO members to vote on proposals and make decisions as a Decentralized Autonomous Organization. It also includes a TimeLockController contract that can be used to add a time delay before proposals can be executed.

#### `Treasury.sol`

This is a light-weight ownable treasure contract that serves as an example for building a treasury within the Collective Governance ecosystem.

## References

Here are some useful references for working with the Collective Governance Contract Suite:

- [Governor Contract Wizard](https://wizard.openzeppelin.com/#governor): This wizard helps you create a customizable governor contract.
- [How to Deploy a DAO on Remix](https://medium.com/coinmonks/how-to-deploy-a-dao-on-remix-a49d166556b9): This tutorial walks you through the steps of deploying a DAO on Remix.
- [CallData Library](https://calldata.netlify.app/): This library provides a user-friendly way to encode call data for smart contract function calls.
- [OpenZeppelin Governance Documentation](https://docs.openzeppelin.com/contracts/4.x/governance): This documentation provides detailed information about the governance functionality provided by the OpenZeppelin contracts.
