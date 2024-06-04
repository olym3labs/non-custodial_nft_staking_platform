//Token Reward on Baobap:  0x8F174e51714108B72B789C86e8d55eafe71c0B4F
// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";
import "@openzeppelin/contracts@5.0.2/token/ERC20/extensions/ERC20Permit.sol";

contract OLYM3Reward is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("OLYM3 Reward", "OLYM3R")
        Ownable(initialOwner)
        ERC20Permit("OLYM3 Reward")
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
