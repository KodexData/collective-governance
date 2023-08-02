// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDaoComments {
    function comment(string memory message, uint256 identifier) external;

    function commentThreshold() external view returns (uint256);

    function owner() external view returns (address);

    function renounceOwnership() external;

    function setCommentThreshold(uint256 newCommentThreshold) external;

    function transferOwnership(address newOwner) external;
}
