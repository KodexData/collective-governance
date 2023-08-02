// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import "../modules/DaoRegistry.sol";
import "../modules/DaoComments.sol";
import "../modules/DaoStorage.sol";

/**
 * @title DaoWrapped
 * @dev A token that wraps an underlying token, with additional features provided by various OpenZeppelin extensions.
 * This contract is designed to be used as part of a DAO system, and inherits from several DAO-related modules.
 */
contract DaoWrapped is
    ERC20,
    ERC20Wrapper,
    ERC20Permit,
    ERC20Votes,
    DaoComments,
    DaoStorage,
    DaoRegistry
{
    /**
     * @dev Constructor function. Initializes the contract with an underlying token, an owner address, a name, and a symbol.
     * @param wrappedToken The address of the underlying token being wrapped.
     * @param owner_ The address of the contract owner.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     */
    constructor(
        IERC20 wrappedToken,
        address payable owner_,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) ERC20Permit(name_) ERC20Wrapper(wrappedToken) {
        transferOwnership(owner_);
    }

    /**
     * @dev Deposits a certain amount of the wrapped token into the contract, on behalf of a specified account, with permit.
     * @param account The address of the account on whose behalf the deposit is being made.
     * @param amount The amount of the wrapped token to deposit.
     * @param deadline The deadline for the permit signature.
     * @param v The v component of the permit signature.
     * @param r The r component of the permit signature.
     * @param s The s component of the permit signature.
     * @return A boolean indicating whether the deposit was successful.
     */
    function depositForWithPermit(
        address account,
        uint256 amount,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual returns (bool) {
        IERC20Permit(address(underlying)).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );
        return depositFor(account, amount);
    }

    // The functions below are overrides required by Solidity.

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

    /**
     * @dev Returns the decimals of the underlying token, if it implements the `IERC20Metadata` interface.
     * If the underlying token does not implement the `IERC20Metadata` interface, then returns the decimals
     * of the wrapped token.
     *
     * @return The number of decimals of the token represented by this contract.
     */
    function decimals()
        public
        view
        override(ERC20, ERC20Wrapper)
        returns (uint8)
    {
        try IERC20Metadata(address(underlying)).decimals() returns (
            uint8 value
        ) {
            return value;
        } catch {
            return super.decimals();
        }
    }
}
