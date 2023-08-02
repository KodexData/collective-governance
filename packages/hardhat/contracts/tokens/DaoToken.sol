// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "../modules/DaoRegistry.sol";
import "../modules/DaoComments.sol";
import "../modules/DaoStorage.sol";

/**
 * @title DaoToken
 * @dev This contract is an implementation of the ERC20 token with additional features
 * to be used within a DAO ecosystem. It includes support for voting, comments, storage,
 * and DAO registry. This contract inherits from the OpenZeppelin ERC20, Ownable, ERC20Permit,
 * and ERC20Votes contracts, as well as the custom DaoComments, DaoStorage, and DaoRegistry contracts.
 */
contract DaoToken is
    ERC20,
    Ownable,
    ERC20Permit,
    ERC20Votes,
    DaoComments,
    DaoStorage,
    DaoRegistry
{
    /**
     * @dev Constructor that initializes the contract with a name, symbol, owner, and initial supply.
     * The owner is also automatically set as the initial token holder.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address payable owner_,
        uint256 initialSupply_
    ) ERC20(name_, symbol_) ERC20Permit(name_) {
        _mint(owner_, initialSupply_ * 10 ** 18);
        transferOwnership(owner_);
    }

    /**
     * @dev Creates new tokens and mints them to the specified address.
     * Only the contract owner can call this function.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(
        address account,
        uint256 amount
    ) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
