---
name: awallet-agent-skills
version: 1.0.0
description: "Amane Protocol Liaison Model (tive-ai) 向け AWallet (ERC-4337) および CDP AgentKit 連携スキル仕様"
metadata:
  protocol: Amane Protocol
  model: Liaison Model (tive-ai)
  network: Base Sepolia (Chain ID: 84532)
---

# AWallet CDP Agent Skills Specification

## 1. 概要 (Overview)
Amane Protocol における Liaison Model (tive-ai) が、Coinbase AgentKit インターフェースを通じて、AWallet (Pimlico ERC-4337 基盤) と A2A (Agent-to-Agent) 自律経済決済を自動操作するためのスキルセットです。

## 2. 定義済みアクション (Actions)
- get_wallet_balance: 指定アドレスの ETH 残高を取得します。
- get_wallet_address: AWallet のスマートアカウントアドレスを照会します。
- execute_gasless_transaction: Pimlico Paymaster スポンサーによりガスレスで UserOperation を実行します。
