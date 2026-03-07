// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title OKE_NFT (Open Knowledge Extraction)
 * @dev AIによって抽出された「事実（Fact）」を不変の証跡として刻むNFT
 */
contract OKE_NFT is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    struct Fact {
        string content;     // 抽出された事実の内容
        uint256 confidence; // AIによる信頼度スコア (0-100)
        string category;   // カテゴリ (Trend, Need, Insight)
        uint256 timestamp; // 抽出日時
    }

    mapping(uint256 => Fact) public facts;

    event FactExtracted(uint256 indexed tokenId, string category, uint256 confidence);

    constructor() ERC721("OKE NFT", "OKE") Ownable(msg.sender) {}

    /**
     * @dev 譲渡不能化 (Soulbound)
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("OKE: Transfer is disabled");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev AIの知見をミントする
     */
    function mintFact(
        address to, 
        string memory metadataURI,
        string memory content,
        uint256 confidence,
        string memory category
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        facts[tokenId] = Fact({
            content: content,
            confidence: confidence,
            category: category,
            timestamp: block.timestamp
        });

        emit FactExtracted(tokenId, category, confidence);
        return tokenId;
    }
}

