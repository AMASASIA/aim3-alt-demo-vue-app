// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SBT is ERC721, Ownable {
    constructor() ERC721("Soul Token", "SOUL") Ownable(msg.sender) {}

    function mintSoul(address user) external onlyOwner returns (uint256) {
        // Use user's address as the unique Token ID (converted to uint256)
        uint256 soulId = uint256(uint160(user));
        
        require(_ownerOf(soulId) == address(0), "Soul already minted");
        
        _mint(user, soulId);
        return soulId;
    }

    // SBT Logic: Prevent all transfers
    function transferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("SBT: Non-transferable");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public pure override {
        revert("SBT: Non-transferable");
    }
}
