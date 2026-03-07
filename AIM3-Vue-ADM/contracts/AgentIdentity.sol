// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ERC8004_AgentIdentity
 * @dev AIエージェントのためのID、評価、および支出制限を管理する規格（概念実証）
 */
contract AgentIdentity is AccessControl {
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");

    struct AgentProfile {
        string name;          // エージェント名 (例: "Tive_Personal_01")
        uint256 reputation;   // オンチェーン評価スコア (x402信用スコア)
        uint256 dailyLimit;   // 1日の使用限度額 (USDC)
        uint256 spentToday;   // 今日の使用額
        uint256 lastReset;    // 最後にリセットされた時間
    }

    mapping(address => AgentProfile) public agents;
    IERC20 public usdcToken;

    event AgentAction(address indexed agent, string actionType, uint256 amount);

    constructor(address _usdc) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        usdcToken = IERC20(_usdc);
    }

    // AIエージェントを登録（3本指Mintで生成されたIDを紐付け）
    function registerAgent(address _agentAddress, string memory _name, uint256 _limit) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(AGENT_ROLE, _agentAddress);
        agents[_agentAddress] = AgentProfile(_name, 100, _limit, 0, block.timestamp);
    }

    // Invisible Payment: AIが自律的に実行する関数
    function executePayment(address _recipient, uint256 _amount, string memory _reason) external onlyRole(AGENT_ROLE) {
        AgentProfile storage agent = agents[msg.sender];

        // 1. 日次リセット判定
        if (block.timestamp > agent.lastReset + 1 days) {
            agent.spentToday = 0;
            agent.lastReset = block.timestamp;
        }

        // 2. 限度額チェック (Invisible Financeの安全性担保)
        require(agent.spentToday + _amount <= agent.dailyLimit, "Daily limit exceeded");
        require(usdcToken.balanceOf(address(this)) >= _amount, "Insufficient funds in Vault");

        // 3. 支払い実行
        agent.spentToday += _amount;
        require(usdcToken.transfer(_recipient, _amount), "Transfer failed");

        // 4. 評価スコアの更新（活動実績として記録）
        agent.reputation += 1; 

        emit AgentAction(msg.sender, _reason, _amount);
    }
}
