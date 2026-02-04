// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Amane Protocol: Sovereign Settlement v1.1
 * @notice プロトコル維持費を5%に固定した、法的防衛機能付き決済コントラクト
 */
contract AmaneProtocolSovereign {
    
    // 5% のプロトコル維持費 (Basis Points: 500 = 5%)
    uint256 public constant PROTOCOL_FEE_BPS = 500;
    address public protocolTreasury; // 維持費の蓄積先（DAO）

    event ServiceFulfillment(
        address indexed provider,
        uint256 totalFee,
        uint256 protocolTake,
        uint256 providerTake,
        bytes32 indexed troisId
    );

    constructor(address _treasury) {
        protocolTreasury = _treasury;
    }

    /**
     * @notice Atomic Mint & Invisible Settlement
     * 5%を自動徴収し、残りをアドボケイトへ分配する
     */
    function settleService(address payable _provider, bytes32 _troisId) external payable {
        require(msg.value > 0, "Fee must be greater than zero");

        uint256 protocolTake = (msg.value * PROTOCOL_FEE_BPS) / 10000;
        uint256 providerTake = msg.value - protocolTake;

        // 1. プロトコル維持費の回収 (5%)
        (bool successTreasury, ) = protocolTreasury.call{value: protocolTake}("");
        require(successTreasury, "Protocol fee transfer failed");

        // 2. アドボケイト/支援者への報酬配分 (95%)
        (bool successProvider, ) = _provider.call{value: providerTake}("");
        require(successProvider, "Provider payment failed");

        emit ServiceFulfillment(_provider, msg.value, protocolTake, providerTake, _troisId);
    }
}
