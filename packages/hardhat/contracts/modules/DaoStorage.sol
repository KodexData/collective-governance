// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DaoStorage
 * @dev This contract manages the storage and management of members, treasury, factory, website and manifest details of a DAO.
 */
contract DaoStorage is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _members;

    /**
     * @dev Emitted when a new member is added to the DAO.
     * @param account The address of the member added.
     * @param timeAdded The timestamp when the member was added.
     * @param purpose The purpose of adding the member.
     */
    event MemberAdded(
        address indexed account,
        uint256 timeAdded,
        string purpose
    );

    /**
     * @dev Emitted when a member is removed from the DAO.
     * @param account The address of the member removed.
     * @param timeRemoved The timestamp when the member was removed.
     * @param reason The reason for removing the member.
     */
    event MemberRemoved(
        address indexed account,
        uint256 timeRemoved,
        string reason
    );

    /**
     * @dev Emitted when the treasury contract address is changed.
     * @param oldAddress The old treasury contract address.
     * @param newAddress The new treasury contract address.
     */
    event TreasuryChanged(
        address indexed oldAddress,
        address indexed newAddress
    );

    /**
     * @dev Emitted when the factory contract address is changed.
     * @param oldAddress The old factory contract address.
     * @param newAddress The new factory contract address.
     */
    event FactoryChanged(
        address indexed oldAddress,
        address indexed newAddress
    );

    /**
     * @dev The website of the DAO.
     */
    string public website;

    /**
     * @dev The treasury contract address of the DAO.
     */
    address public treasury;

    /**
     * @dev The manifest of the DAO.
     */
    string public manifest;

    /**
     * @dev The factory contract address of the DAO.
     */
    address public factory;

    /**
     * @dev Sets the website of the DAO.
     * @param url The URL of the website to be set.
     */
    function setWebsite(string memory url) public onlyOwner {
        website = url;
    }

    /**
     * @dev Sets the treasury contract address of the DAO.
     * @param contractAddress The address of the treasury contract to be set.
     */
    function setTreasury(address contractAddress) public onlyOwner {
        emit TreasuryChanged(treasury, contractAddress);
        treasury = contractAddress;
    }

    /**
     * @dev Sets the factory contract address of the DAO.
     * @param contractAddress The address of the factory contract to be set.
     */
    function setFactory(address contractAddress) public onlyOwner {
        emit FactoryChanged(treasury, contractAddress);
        factory = contractAddress;
    }

    /**
     * @dev Sets the manifest of the DAO.
     * @param hashOrUrl The hash or URL of the manifest to be set.
     */
    function setManifest(string memory hashOrUrl) public onlyOwner {
        manifest = hashOrUrl;
    }

    /**
     * @dev Adds a new member to the DAO.
     * @param account The address of the member to be added.
     * @param purpose The purpose of adding the member.
     */
    function addMember(
        address account,
        string memory purpose
    ) public onlyOwner {
        require(
            !_members.contains(account),
            "DaoStorage: member already registered"
        );
        _members.add(account);
        emit MemberAdded(account, block.timestamp, purpose);
    }

    /**
     * @notice Remove a member from the DAO
     * @param account The address of the member to remove
     * @param reason The reason for removing the member
     * Requirements:
     * - the caller must be the owner of the contract
     * - the specified account must be a registered member of the DAO
     * Emits a MemberRemoved event.
     */
    function removeMember(
        address account,
        string memory reason
    ) public onlyOwner {
        require(
            _members.contains(account),
            "DaoStorage: member not registered"
        );
        _members.remove(account);
        emit MemberRemoved(account, block.timestamp, reason);
    }

    /**
     * @notice Remove the sender's address from the DAO
     * @param reason The reason for leaving the DAO
     * Requirements:
     * - the sender must be a registered member of the DAO
     * Emits a MemberRemoved event.
     */
    function leaveDAO(string memory reason) public {
        require(
            _members.contains(_msgSender()),
            "DaoStorage: you are not registered"
        );
        _members.remove(_msgSender());
        emit MemberRemoved(_msgSender(), block.timestamp, reason);
    }

    /**
     * @notice Check if an address is a registered member of the DAO
     * @param account The address to check
     * @return true if the specified address is a registered member of the DAO, false otherwise
     */
    function isMember(address account) public view returns (bool) {
        return _members.contains(account);
    }

    /**
     * @notice Get the total number of registered members in the DAO
     * @return The total number of registered members
     */
    function totalMembers() public view returns (uint256) {
        return _members.length();
    }

    /**
     * @notice Get the list of all registered members in the DAO
     * @return members An array of registered member addresses
     */
    function allMembers() public view returns (address[] memory members) {
        return _members.values();
    }
}
