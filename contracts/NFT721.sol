//NFT Collection on Baobap: 0xf36c7E45fa1ccedD470C41D22B26993ab5CEbca9

// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.2/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@5.0.2/access/Ownable.sol";

contract Olym3NFT is ERC721, Ownable {
    constructor(address initialOwner)
        ERC721("Olym3 NFT Collection", "OLYM3NFT")
        Ownable(initialOwner)
    {}

    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
