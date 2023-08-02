// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDaoRegistry {
    function activateDAO(
        address contractAddress,
        string memory purpose
    ) external;

    function allDAOs() external view returns (address[] memory daos);

    function deactivateDAO(
        address contractAddress,
        string memory reason
    ) external;

    function isActiveDAO(address contractAddress) external view returns (bool);

    function owner() external view returns (address);

    function renounceOwnership() external;

    function totalDAOs() external view returns (uint256);

    function transferOwnership(address newOwner) external;
}
