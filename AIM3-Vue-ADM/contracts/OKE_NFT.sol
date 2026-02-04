// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract OKE_NFT is ERC721URIStorage {

    uint256 public nextTokenId;

    constructor() ERC721("OKE NFT", "OKE") {}

    function mint(address to, string memory metadataURI) 
        external 
        returns (uint256) 
    {
        uint256 tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        return tokenId;
    }
}
