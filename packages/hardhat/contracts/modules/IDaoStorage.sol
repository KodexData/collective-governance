// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDaoStorage {
    function addMember(address account, string memory purpose) external;

    function allMembers() external view returns (address[] memory members);

    function factory() external view returns (address);

    function isMember(address account) external view returns (bool);

    function leaveDAO(string memory reason) external;

    function manifest() external view returns (string memory);

    function owner() external view returns (address);

    function removeMember(address account, string memory reason) external;

    function renounceOwnership() external;

    function setFactory(address contractAddress) external;

    function setManifest(string memory hashOrUrl) external;

    function setTreasury(address contractAddress) external;

    function setWebsite(string memory url) external;

    function totalMembers() external view returns (uint256);

    function transferOwnership(address newOwner) external;

    function treasury() external view returns (address);

    function website() external view returns (string memory);
}
