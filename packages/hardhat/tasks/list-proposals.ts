import { task } from 'hardhat/config'
import { dump } from 'js-yaml'
import { GOVERNOR } from './constants'

task('list-proposals', 'Lists all Proposals from given Governance contract')
  .addOptionalParam('address', 'contract address to Governance contract')
  .setAction(async ({ address }, { ethers }) => {
    if (!address && GOVERNOR && GOVERNOR.isAddress()) address = GOVERNOR
    if (!address || !address.isAddress()) throw new Error(`invalid contract address: ${address}`)
    const { parseProposalState } = await import('@collective-governance/api-evm')
    const contract = await ethers.getContractAt('Governance', address)
    const data = await contract.queryFilter(contract.filters.ProposalCreated())

    for (const event of data.reverse()) {
      const { transactionHash, blockNumber, args } = event
      const { proposer, description, startBlock, endBlock, targets, calldatas, proposalId } = args
      const state = await contract.state(proposalId)
      const { forVotes, againstVotes, abstainVotes } = await contract.proposalVotes(proposalId)
      const headline = description.split('\n')[0]

      console.log(`${'-'.repeat(process.stdout.columns)}`)
      console.group(`${headline}`.toCyan())

      let output = `STATUS: ${parseProposalState(state)}\n`
      output += `FOR: ${forVotes} AGAINST: ${againstVotes} ABSTAIN: ${abstainVotes}\n`
      output += `START: ${startBlock} END: ${endBlock}\n`
      output += `PROPOSER: ${proposer} @ ${blockNumber}\n`
      output += `TX: ${transactionHash}\n`
      output += `ID: ${proposalId}\n`

      console.log(output)
      console.log(dump({ targets, calldatas }))
      console.groupEnd()
    }
  })
