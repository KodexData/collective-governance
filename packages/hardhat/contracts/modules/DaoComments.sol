// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";

/**
 * @title DaoComments
 * @dev This contract allows members of a DAO to leave comments on proposals.
 * Comments can only be left if the member has enough voting power in the DAO,
 * as determined by the commentThreshold set by the owner of the contract.
 */
abstract contract DaoComments is Ownable {
    /**
     * @dev The commentThreshold represents the minimum amount of voting power
     * required for a member to leave comments on proposals.
     */
    uint256 private _commentThreshold = 1e18;

    /**
     * @dev Emitted when the comment threshold is set by the owner of the contract.
     */
    event CommentThresholdSet(
        uint256 oldCommentThreshold,
        uint256 newCommentThreshold
    );

    /**
     * @dev Emitted when a member leaves a comment on a proposal.
     */
    event Comment(
        address indexed member,
        uint256 proposalId,
        uint256 timestamp,
        string message
    );

    /**
     * @dev Sets a new comment threshold, which determines the minimum amount
     * of voting power required for a member to leave comments on proposals.
     * @param newCommentThreshold The new comment threshold to be set.
     */
    function setCommentThreshold(uint256 newCommentThreshold) public onlyOwner {
        emit CommentThresholdSet(_commentThreshold, newCommentThreshold);
        _commentThreshold = newCommentThreshold;
    }

    /**
     * @dev Returns the current comment threshold.
     * @return The current comment threshold.
     */
    function commentThreshold() public view virtual returns (uint256) {
        return _commentThreshold;
    }

    /**
     * @dev Allows a member to leave a comment on a proposal.
     * The member must have enough voting power to meet the comment threshold.
     * @param message The message to be included in the comment.
     * @param identifier The identifier of the proposal.
     */
    function comment(string memory message, uint256 identifier) public {
        require(
            IVotes(address(this)).getVotes(msg.sender) >= _commentThreshold,
            "DaoComments: Not enough voting power to lea comments"
        );
        emit Comment(msg.sender, identifier, block.timestamp, message);
    }
}
