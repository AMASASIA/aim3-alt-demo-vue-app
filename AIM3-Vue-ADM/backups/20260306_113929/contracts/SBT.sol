// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title SBT (Soul Bound Token)
 * @dev Non-transferable token representing identity/reputation in Tive AI.
 */
contract SBT is ERC721, Ownable2Step {
    constructor() ERC721("Tive Soul", "TSOUL") Ownable(msg.sender) {}

    /**
     * @dev Mint a soulbound token. Can only be called by the owner (e.g., AtomicMint contract).
     */
    function mintSoul(address user) external onlyOwner returns (uint256) {
        // Use user's address as the unique Token ID
        uint256 soulId = uint256(uint160(user));
        
        require(_ownerOf(soulId) == address(0), "SBT: Soul already minted");
        
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
    
    // Additional restriction to ensure no one can transfer
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("SBT: Soulbound tokens cannot be transferred");
        }
        return super._update(to, tokenId, auth);
    }
}
