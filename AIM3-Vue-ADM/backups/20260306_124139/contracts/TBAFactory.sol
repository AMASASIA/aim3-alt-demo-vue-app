// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * @title TBAFactory
 * @dev Factory for creating ERC-6551 style Token Bound Accounts.
 */
contract TBAFactory {
    event AccountCreated(address account, uint256 chainId, address tokenContract, uint256 tokenId, uint256 salt);

    /**
     * @dev Create a deterministic TBA for a given token.
     */
    function createAccount(uint256 tokenId, address tokenContract) external returns (address) {
        // In a production ERC-6551 implementation, this would use the ERC-6551 Registry logic
        // For the OKE Card demo, we generate a deterministic address based on the token
        
        uint256 salt = uint256(keccak256(abi.encodePacked(tokenId, tokenContract)));
        
        // Mocking the deployment address calculation (Create2 style)
        address account = address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(abi.encodePacked("TBA_INIT_CODE_MOCK"))
        )))));
        
        emit AccountCreated(account, block.chainid, tokenContract, tokenId, salt);
        return account;
    }
}
