// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "./modules/ForAgainstQuorum.sol";

/**
 * @title Governance
 * @dev This contract extends the OpenZeppelin `Governor`, `GovernorSettings`, `GovernorVotes`,
 * `GovernorVotesQuorumFraction`, and `GovernorTimelockControl` contracts, as well as the custom
 * `ForAgainstQuorum` contract.
 * This contract implements a governance system for voting on proposals. The voting mechanism
 * requires a quorum to be reached and a majority of votes in favor of the proposal in order for it
 * to pass. The quorum is calculated as a fraction of the total votes based on the number of
 * outstanding votes.
 * Users can propose a new action to be taken by the contract, which must then be approved by the
 * community through a voting process. Once approved, the action is executed by the contract.
 */
contract Governance is
    Governor,
    GovernorSettings,
    ForAgainstQuorum,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    /**
     * @dev Initializes a new instance of the Governance contract.
     * @param _token The address of the token contract used for voting.
     * @param _timelock The address of the TimelockController contract used to execute proposals.
     * @param _votingPeriod The duration in blocks for which a proposal can be voted on.
     * @param _name The Name of the governance contract.
     */
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingPeriod,
        string memory _name
    )
        Governor(_name)
        GovernorSettings(1 /* 1 block */, _votingPeriod /* 1 week */, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
        GovernorTimelockControl(_timelock)
    {}

    // The following functions are overrides required by Solidity.
    /**
     * @dev Returns the delay before voting on a proposal may take place, once proposed.
     * Overrides GovernorSettings.votingDelay().
     * @return The delay before voting on a proposal may take place, once proposed.
     */
    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    /**
     * @dev Returns the duration of the voting period.
     * @return The duration of the voting period, in blocks.
     */
    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    /**
     * @dev Overrides the `quorum` function in `GovernorVotesQuorumFraction` to return the quorum required for the given block number.
     * @param blockNumber The block number for which to retrieve the quorum requirement.
     * @return The quorum required for the given block number.
     */
    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    /**
     * @dev Overrides the `state` function from the `GovernorTimelockControl` contract to return the state of a given proposal.
     * @param proposalId The ID of the proposal to check the state of.
     * @return The state of the proposal, represented as a value of the `ProposalState` enum.
     */
    function state(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    /**
     * @notice Propose a new governance proposal.
     * @dev See {Governor} and {IGovernor} for parameter details.
     * @param targets The ordered list of target addresses for calls to be made during proposal execution.
     * @param values The ordered list of values (i.e. ETH) to be passed with the calls made during proposal execution.
     * @param calldatas The ordered list of data (i.e. function calls) to be passed with the calls made during proposal execution.
     * @param description A description of the proposal.
     * @return The ID of the newly created proposal.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    /**
     * @dev Returns the minimum number of tokens that must participate in a proposal for it to be valid.
     * @return The proposal threshold.
     */
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    /**
     * @dev Executes a proposal if it is successful and has been passed and the associated timelock has expired.
     * Overrides `Governor._execute` and `GovernorTimelockControl._execute`.
     * @param proposalId ID of the proposal to execute.
     * @param targets List of contract addresses to execute calls on.
     * @param values List of ETH values (in wei) to pass with calls.
     * @param calldatas List of calldata payloads to execute.
     * @param descriptionHash Hash of the proposal description.
     */
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    /**
     * @notice Cancels a proposal, unlocking the proposal's tokens and deleting the proposal.
     * @dev Deletes the proposal and transfers the proposal's tokens back to the sender. This function can only be called by the governor. If the proposal is already expired, the tokens are transferred back immediately.
     * @param targets The ordered list of target addresses for calls to be made during proposal execution.
     * @param values The ordered list of values (i.e. amounts) to be passed as the ETH value to the corresponding target address.
     * @param calldatas The ordered list of calldata to be passed to each target address.
     * @param descriptionHash The hash of the proposal description.
     * @return The ID of the cancelled proposal.
     */
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /**
     * @notice Returns the address of the contract responsible for executing proposals.
     * @dev Overrides the `_executor` function in `GovernorTimelockControl`.
     * @return The address of the contract responsible for executing proposals.
     */
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
