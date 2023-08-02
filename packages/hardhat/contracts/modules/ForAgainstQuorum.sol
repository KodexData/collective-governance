// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";

interface IForAgainstQuorum {
    function COUNTING_MODE() external pure returns (string memory);

    function quorum(uint256 snapshotId) external view returns (uint256);

    function proposalVotes(
        uint256 proposalId
    )
        external
        view
        returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes);

    function _quorumReached(uint256 proposalId) external view returns (bool);

    function _voteSucceeded(uint256 proposalId) external view returns (bool);
}

/**
 * @title ForAgainstQuorum
 * @dev The voting mechanism implemented in this contract is a simple on-chain voting system for a governance process.
 * The mechanism requires a quorum of votes in favor of a proposal, with a successful outcome determined by a
 * greater number of "for" votes than "against" votes and meeting the quorum requirement.
 */
abstract contract ForAgainstQuorum is GovernorCountingSimple {
    /**
     * @dev Returns the counting mode for the voting process.
     * @return A string indicating that this contract uses a quorum of "for" votes, as well as "against" votes, and that
     * a proposal is considered successful if the number of "for" votes is greater than the number of "against"
     * votes and meets the quorum requirement.
     */
    function COUNTING_MODE()
        public
        pure
        override(GovernorCountingSimple)
        returns (string memory)
    {
        return "quorum=for,against&succeed=for>against";
    }

    /**
     * @dev Checks if the quorum requirement for a proposal has been met.
     * @param proposalId The ID of the proposal.
     * @return A boolean indicating whether the quorum requirement has been met.
     */
    function _quorumReached(
        uint256 proposalId
    ) internal view virtual override(GovernorCountingSimple) returns (bool) {
        (uint256 againstVotes, uint256 forVotes, ) = proposalVotes(proposalId);
        if (forVotes > againstVotes) {
            return forVotes >= quorum(proposalSnapshot(proposalId));
        }
        return false;
    }

    /**
     * @dev Checks if a proposal has been successful.
     * @param proposalId The ID of the proposal.
     * @return A boolean indicating whether the proposal has been successful.
     */
    function _voteSucceeded(
        uint256 proposalId
    ) internal view virtual override(GovernorCountingSimple) returns (bool) {
        (uint256 againstVotes, uint256 forVotes, ) = proposalVotes(proposalId);
        return forVotes > againstVotes && _quorumReached(proposalId);
    }
}
