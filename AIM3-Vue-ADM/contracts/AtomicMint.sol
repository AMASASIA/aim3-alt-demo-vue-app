// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SBT.sol";
import "./TBAFactory.sol";
import "./OKE_NFT.sol";

contract AtomicMint {

    SBT public sbt;
    TBAFactory public tbaFactory;
    OKE_NFT public oke; // Added

    event AtomicMinted(
        address indexed user,
        uint256 sbtId,
        uint256 nftId,
        address tbaAddress,
        string metadataURI
    );

    constructor(
        address _sbt,
        address _tbaFactory,
        address _oke
    ) {
        sbt = SBT(_sbt);
        tbaFactory = TBAFactory(_tbaFactory);
        oke = OKE_NFT(_oke); 
    }

    function atomicMint(address user, string memory metadataURI)
        external
        returns (uint256 sbtId, uint256 nftId, address tba)
    {
        // 1. SBT Mint
        // Check if user already has SBT to avoid revert? logic in SBT handles it but reverts.
        // For atomic mint, we might want to check first or try. 
        // Assuming fresh user for demo.
        // Note: SBT mintSoul is onlyOwner. AtomicMint contract needs to be the owner of SBT contract!
        sbtId = sbt.mintSoul(user);

        // 2. TBA (Token Bound Account) creation
        // Pass SBT ID as the token to bind the account to? Or the OKE NFT?
        // User prompt says: "tba = tbaFactory.createAccount(sbtId, user);"
        // My TBAFactory impl uses (tokenId, tokenContract).
        // Let's match the prompt's intent: Soul Bound Token gets a TBA.
        tba = tbaFactory.createAccount(sbtId, address(sbt));

        // 3. OKE NFT Mint
        // OKE mint is external. If it has onlyOwner, AtomicMint needs to be owner or minter.
        // OKE_NFT provided has no access control on mint(), currently 'external'. 
        // Realistically it should be restricted, but for this demo step `mint` is open.
        nftId = oke.mint(user, metadataURI);

        emit AtomicMinted(user, sbtId, nftId, tba, metadataURI);
    }
}
