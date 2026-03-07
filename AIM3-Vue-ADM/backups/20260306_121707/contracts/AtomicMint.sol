// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./SBT.sol";
import "./TBAFactory.sol";
import "./OKE_NFT.sol";
import "./IVerifier.sol";

/**
 * @title AtomicMint
 * @dev Secure controller for minting OKE Cards (SBT + TBA + NFT) with ZKP verification.
 */
contract AtomicMint is Ownable2Step, ReentrancyGuard, Pausable {

    SBT public sbt;
    TBAFactory public tbaFactory;
    OKE_NFT public oke;
    IVerifier public verifier;

    // Replay protection: Store nullifiers to prevent reusing the same ZKP proof
    mapping(bytes32 => bool) public nullifierUsed;

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
        address _oke,
        address _verifier
    ) Ownable(msg.sender) {
        sbt = SBT(_sbt);
        tbaFactory = TBAFactory(_tbaFactory);
        oke = OKE_NFT(_oke);
        verifier = IVerifier(_verifier);
    }

    /**
     * @dev Sets a new verifier address. 
     */
    function setVerifier(address _verifier) external onlyOwner {
        verifier = IVerifier(_verifier);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Mint OKE Card with Zero-Knowledge Proof.
     * @param user The recipient address.
     * @param metadataURI IPFS CID for metadata.
     * @param nullifier A unique hash to prevent proof re-use.
     * @param a, b, c ZKP proof parameters.
     * @param input Public inputs for the ZKP.
     */
    function mintWithProof(
        address user,
        string calldata metadataURI,
        bytes32 nullifier,
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[1] calldata input
    ) external nonReentrant whenNotPaused returns (uint256 sbtId, uint256 nftId, address tba) {
        // 1. Replay protection
        require(!nullifierUsed[nullifier], "ZKP: Nullifier already used");
        
        // 2. Mathematical Verification
        require(verifier.verifyProof(a, b, c, input), "ZKP: Verification failed");
        
        // Mark nullifier as used
        nullifierUsed[nullifier] = true;

        // 3. SBT Mint
        // Note: AtomicMint must be the owner of the SBT contract to call mintSoul
        sbtId = sbt.mintSoul(user);

        // 4. TBA (Token Bound Account) creation
        tba = tbaFactory.createAccount(sbtId, address(sbt));

        // 5. OKE NFT Mint
        nftId = oke.mintFact(user, metadataURI, "Atomic Mint Fact", 100, "Initialization");

        emit AtomicMinted(user, sbtId, nftId, tba, metadataURI);
    }
}
