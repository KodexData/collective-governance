# collective-governance/api-evm Documentation

The `@collective-governance/api-evm` is a library that provides an API for interacting with the Collective Governance contracts on the Ethereum Virtual Machine (EVM). This library allows you to retrieve information about the state of proposals, votes, and other governance-related data.

## Usage

To use the `@collective-governance/api-evm` library, you can start by importing the `QueryApi` class:

```ts
import { QueryApi } from '@collective-governance/api-evm' 
```

You can then initialize the `QueryApi` instance by providing the address of the governance contract and a provider. In the following example, we're using a `WebSocketProvider` to connect to a local Ethereum network:

```ts
const api = QueryApi()

api.initialize({
  governor: '0x0',
  provider: new WebSocketProvider('ws://localhost:8545')
})
```

Once the API is initialized, you can use it to retrieve information about proposals and votes. For example, the following code retrieves a list of all proposals:

```ts
api.buildProposalBoard().then(console.log)
```

This will return an array of objects, each representing a proposal.

## API Reference

The following methods are available on the `QueryApi` class:

### `initialize(config: { governor: string, provider: ethers.providers.Provider }): void`

This method initializes the API instance by providing the address of the governance contract and a provider. The `config` parameter should be an object with the following properties:

* `governor`: The address of the governance contract on the EVM.
* `provider`: An instance of an `ethers.providers.Provider` object that connects to an Ethereum node.

### `buildProposalBoard(): Promise<ProposalBoard[]>`

This method returns a list of all proposals in the governance contract, along with their metadata. The return value is a `Promise` that resolves to an array of `ProposalBoard` objects.

### `getProposal(id: number): Promise<Proposal>`

This method returns the details of a single proposal with the specified ID. The return value is a `Promise` that resolves to a `Proposal` object.

### `getVote(id: number): Promise<Vote>`

This method returns the details of a single vote with the specified ID. The return value is a `Promise` that resolves to a `Vote` object.

### `getVoter(voter: string): Promise<Voter>`

This method returns the details of a single voter with the specified address. The return value is a `Promise` that resolves to a `Voter` object.

## References

Here are some useful references for working with the `@collective-governance/api-evm` library:

* [Ethers.js Documentation](https://docs.ethers.io/v5/): This documentation provides detailed information about the Ethers.js library, which is used by the `@collective-governance/api-evm` library to connect to an Ethereum node.
* [OpenZeppelin Governance Documentation](https://docs.openzeppelin.com/contracts/4.x/governance): This documentation provides detailed information about the governance functionality provided by the OpenZeppelin contracts.
* [Collective Governance Documentation](https://github.com/collective-governance/contracts): This documentation provides information about the Collective Governance contracts themselves.
