// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DaoRegistry
 * @dev This contract manages the registration and activation of DAO contracts.
 */
contract DaoRegistry is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _daos;

    /**
     * @dev Emitted when a new DAO contract is activated.
     * @param contractAddress The address of the activated DAO contract.
     * @param timeActivated The timestamp at which the DAO was activated.
     * @param purpose The purpose of the DAO.
     */
    event ActivatedDAO(
        address indexed contractAddress,
        uint256 timeActivated,
        string purpose
    );

    /**
     * @dev Emitted when a DAO contract is deactivated.
     * @param contractAddress The address of the deactivated DAO contract.
     * @param timeDeactivated The timestamp at which the DAO was deactivated.
     * @param reason The reason for deactivating the DAO.
     */
    event DeactivatedDAO(
        address indexed contractAddress,
        uint256 timeDeactivated,
        string reason
    );

    /**
     * @dev Activates a DAO contract, adding it to the set of active DAOs.
     * @param contractAddress The address of the DAO contract to activate.
     * @param purpose The purpose of the DAO.
     */
    function activateDAO(
        address contractAddress,
        string memory purpose
    ) public onlyOwner {
        require(
            !_daos.contains(contractAddress),
            "DaoRegistry: DAO already activated"
        );
        _daos.add(contractAddress);
        emit ActivatedDAO(contractAddress, block.timestamp, purpose);
    }

    /**
     * @dev Deactivates a DAO contract, removing it from the set of active DAOs.
     * @param contractAddress The address of the DAO contract to deactivate.
     * @param reason The reason for deactivating the DAO.
     */
    function deactivateDAO(
        address contractAddress,
        string memory reason
    ) public onlyOwner {
        require(
            _daos.contains(contractAddress),
            "DaoRegistry: unknown DAO address"
        );
        _daos.remove(contractAddress);
        emit DeactivatedDAO(contractAddress, block.timestamp, reason);
    }

    /**
     * @dev Checks whether a DAO contract is active.
     * @param contractAddress The address of the DAO contract to check.
     * @return A boolean indicating whether the DAO contract is active.
     */
    function isActiveDAO(address contractAddress) public view returns (bool) {
        return _daos.contains(contractAddress);
    }

    /**
     * @dev Returns the total number of active DAOs.
     * @return An unsigned integer representing the total number of active DAOs.
     */
    function totalDAOs() public view returns (uint256) {
        return _daos.length();
    }

    /**
     * @dev Returns an array of all active DAO contract addresses.
     * @return daos An array of all active DAO contract addresses.
     */
    function allDAOs() public view returns (address[] memory daos) {
        return _daos.values();
    }
}
