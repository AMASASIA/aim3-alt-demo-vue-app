// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PluralityEngine.sol";

interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract SoulPointSBT is ERC721, Ownable, IERC5192 {
    using PluralityEngine for uint256[];

    struct SoulData {
        uint256 score;      // The current SOUL points
        bytes32 latestTask; // Hash of the latest contributing task
        uint256 timestamp;
        uint256 pluralScore; // Component breakdown
        uint256 whaleScore;  // Component breakdown
    }

    mapping(uint256 => SoulData) public soulData;
    mapping(uint256 => bool) public isLocked;
    
    // Default Parameters for the ecosystem
    PluralityEngine.Params public params;

    // Events
    event SoulMinted(address indexed user, uint256 score, uint256 tokenId);
    event SoulUpdated(address indexed user, uint256 newScore, bytes32 taskId);
    event ParamsUpdated(uint256 alpha, uint256 beta);

    constructor() ERC721("Soul Point", "SOUL") Ownable(msg.sender) {
        // Initialize default params based on doc:
        // alpha=0.6, beta=2.0, lambda=0.15, gamma=1.5, K=3
        params = PluralityEngine.Params({
            alpha: 6 * 10**17,  // 0.6
            beta: 2 * 10**18,   // 2.0
            lambda: 15 * 10**16,// 0.15
            gamma: 15 * 10**17, // 1.5
            kappa: 1 * 10**18,  // 1.0 (assuming normal scale)
            K: 3,
            M: 10 // Example network size
        });
    }

    // --- IERC5192 Implementation ---
    function locked(uint256 tokenId) external view override returns (bool) {
        return isLocked[tokenId];
    }

    // --- Core Logic ---

    function mintOrUpdate(
        address user, 
        uint256[] memory contributions, 
        uint256 contextCost,
        bytes32 taskId
    ) external onlyOwner {
        uint256 tokenId = uint256(uint160(user));
        
        // Calculate Score using Engine
        uint256 finalScore = PluralityEngine.calculateScore(contributions, params, contextCost);
        
        // Store metadata
        soulData[tokenId] = SoulData({
            score: finalScore,
            latestTask: taskId,
            timestamp: block.timestamp,
            pluralScore: PluralityEngine.calcPlural(contributions, params, contextCost),
            whaleScore: PluralityEngine.calcWhale(contributions, params)
        });

        if (_ownerOf(tokenId) == address(0)) {
            _mint(user, tokenId);
            isLocked[tokenId] = true; // SBT is locked by default
            emit Locked(tokenId);
            emit SoulMinted(user, finalScore, tokenId);
        } else {
            emit SoulUpdated(user, finalScore, taskId);
        }
    }

    function updateParams(
        uint256 _alpha, 
        uint256 _beta, 
        uint256 _lambda, 
        uint256 _gamma, 
        uint256 _kappa, 
        uint256 _K, 
        uint256 _M
    ) external onlyOwner {
        params = PluralityEngine.Params(_alpha, _beta, _lambda, _gamma, _kappa, _K, _M);
        emit ParamsUpdated(_alpha, _beta);
    }

    // --- Overrides for SBT ---
    function transferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("SBT: Locked");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public pure override {
        revert("SBT: Locked");
    }
}
