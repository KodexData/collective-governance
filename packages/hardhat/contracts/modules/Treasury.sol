// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

/**
 * @title Treasury
 * @dev This contract allows an owner to manage deposits and withdrawals of Ether and ERC20 tokens.
 */
contract Treasury is Ownable, ReentrancyGuard {
    using Address for address payable;
    address public daoAddress;

    event Deposited(address indexed token, uint256 amount, uint256 timestamp);
    event Withdrawn(
        address indexed payee,
        address indexed token,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Constructor function.
     * @param owner_ The address of the owner of the contract.
     */
    constructor(address payable owner_) {
        transferOwnership(owner_);
    }

    /**
     * @dev Function to receive Ether. msg.data must be empty.
     */
    receive() external payable {
        emit Deposited(address(0), msg.value, block.timestamp);
    }

    /**
     * @dev Withdraws Ether to the specified address.
     * @param payee The address to which Ether will be withdrawn.
     * @param amount The amount of Ether to withdraw.
     */
    function withdraw(
        address payable payee,
        uint256 amount
    ) public virtual onlyOwner {
        require(amount <= address(this).balance, "Treasury: amount too high");
        require(payee != address(0), "Treasury: zero address provided");

        payee.sendValue(amount);
        emit Withdrawn(payee, address(0), amount, block.timestamp);
    }

    /**
     * @dev Withdraws ERC20 tokens to the specified address.
     * @param token The address of the ERC20 token to withdraw.
     * @param payee The address to which ERC20 tokens will be withdrawn.
     * @param amount The amount of ERC20 tokens to withdraw.
     */
    function withdrawERC20(
        IERC20 token,
        address payable payee,
        uint256 amount
    ) public virtual onlyOwner {
        require(
            amount <= token.balanceOf(address(this)),
            "Treasury: amount too high"
        );
        require(payee != address(0), "Treasury: zero address provided");

        SafeERC20.safeTransfer(token, payee, amount);
        emit Withdrawn(payee, address(token), amount, block.timestamp);
    }

    /**
     * @dev Withdraws Ether equally among a specified list of addresses.
     * @param payees The list of addresses to which Ether will be withdrawn.
     */
    function withdrawEven(
        address payable[] memory payees
    ) public virtual onlyOwner {
        require(payees.length > 1, "Treasury: not enough payees");
        require(address(this).balance > 0, "Treasury: no balance to withdraw");

        uint256 amount = address(this).balance / payees.length;

        for (uint256 i = 0; i < payees.length; i++) {
            address payable payee = payees[i];
            withdraw(payee, amount);
        }
    }

    /**
     * @notice Withdraws an even amount of ERC20 tokens to multiple payees.
     * @dev The amount of tokens available to withdraw must be evenly divisible by the number of payees.
     * @param token The ERC20 token to withdraw.
     * @param payees An array of payee addresses.
     */
    function withdrawERC20Even(
        IERC20 token,
        address payable[] memory payees
    ) public virtual onlyOwner {
        require(payees.length > 1, "Treasury: not enough payees");
        require(
            token.balanceOf(address(this)) > 0,
            "Treasury: no balance to withdraw"
        );

        uint256 amount = token.balanceOf(address(this)) / payees.length;

        for (uint256 i = 0; i < payees.length; i++) {
            address payable payee = payees[i];
            withdrawERC20(token, payee, amount);
        }
    }

    /**
     * @notice Deposits ERC20 tokens into the treasury contract.
     * @dev This function transfers ERC20 tokens from the caller to the treasury contract.
     * @param token The ERC20 token to deposit.
     * @param amount The amount of tokens to deposit.
     * @return true if the deposit was successful.
     */
    function depositToken(
        ERC20 token,
        uint256 amount
    ) public virtual returns (bool) {
        require(token.totalSupply() > 0, "Treasury: invalid token");
        require(
            token.balanceOf(_msgSender()) >= amount,
            "Treasury: insufficient balance"
        );

        SafeERC20.safeTransferFrom(token, _msgSender(), address(this), amount);
        emit Deposited(address(token), amount, block.timestamp);
        return true;
    }

    /**
     * @notice Deposits ERC20 tokens into the treasury contract with permit.
     * @dev This function calls the permit function on the ERC20 token contract to allow the treasury contract to spend tokens on behalf of the caller, and then transfers the ERC20 tokens from the caller to the treasury contract.
     * @param token The ERC20 token to deposit.
     * @param amount The amount of tokens to deposit.
     * @param deadline The deadline for the permit to be used.
     * @param v The v component of the permit signature.
     * @param r The r component of the permit signature.
     * @param s The s component of the permit signature.
     * @return true if the deposit was successful.
     */
    function depositTokenWithPermit(
        ERC20 token,
        uint256 amount,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public virtual returns (bool) {
        require(token.totalSupply() > 0, "Treasury: invalid token");
        require(
            token.balanceOf(_msgSender()) >= amount,
            "Treasury: insufficient balance"
        );
        IERC20Permit(address(token)).permit(
            msg.sender,
            address(this),
            amount,
            deadline,
            v,
            r,
            s
        );
        return depositToken(token, amount);
    }
}
