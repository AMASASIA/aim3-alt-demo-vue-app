// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Create2.sol";

// Minimal TBA Factory (ERC-6551 style stub for demo)
contract TBAFactory {
    event AccountCreated(address account, uint256 chainId, address tokenContract, uint256 tokenId, uint256 salt);

    function createAccount(uint256 tokenId, address tokenContract) external returns (address) {
        // In a real implementation this would deploy an ERC-6551 Account Proxy via Create2
        // For this demo, we just generate a deterministic address or mock it
        // We will just return a mock address for now or deploy a simple wallet
        
        // Mock deployment for demo purposes:
        address account = address(uint160(uint256(keccak256(abi.encodePacked(tokenId, tokenContract, block.timestamp)))));
        
        emit AccountCreated(account, block.chainid, tokenContract, tokenId, 0);
        return account;
    }
}
