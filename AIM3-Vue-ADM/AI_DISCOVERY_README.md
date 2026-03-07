# 🌟 AIM3 AI Discovery Engine

## 概要

**「情報の重力からの解放」**を実現する、Instagram/Threads向けAIニーズ抽出システム。

Gemini 1.5 Proを活用し、SNS投稿から**潜在的ニーズ**を自動抽出し、Personal Notebookに**アクションプラン**として記録します。

## 🎯 コンセプト

### Zero-Entry Intelligence
- **入力不要**: キーワードとハンドル名を指定するだけ
- **自動抽出**: AIが投稿を分析し、ニーズを炙り出す
- **即座に記録**: Notebookに自動保存、Timelineも生成

### Antigravity Philosophy
```
従来: 情報を探す → 読む → 理解する → 行動する
AIM3:  キーワード指定 → AIが分析 → アクションプラン受け取る
```

## ✨ 機能

### 1. AI Discovery Panel
- Instagram/Threads選択
- ターゲットハンドル入力
- キーワード指定（3〜10個）
- ワンクリックで抽出開始

### 2. Gemini 1.5 Pro分析
システムプロンプト:
```
Role: 高度なインサイト抽出エージェント
Philosophy: "情報の重力からの解放"

分析フレームワーク:
1. SCAN: キーワードマッチング投稿を特定
2. DECODE: 行間を読む - 暗示された問題は？
3. PREDICT: 次に必要なものは？
4. SYNTHESIZE: 3つのアクションプランを作成
```

### 3. 自動Notebook記録
抽出結果は以下の形式で保存:
- **検出されたニーズ**: 5つの潜在的欲求
- **アクションプラン**: 3つの具体的な次のステップ
- **Timeline提案**: 実行スケジュールを自動生成
- **メタデータ**: プラットフォーム、ハンドル、キーワード、投稿数

## 🏗️ アーキテクチャ

```
┌─────────────────────┐
│ Instagram/Threads   │
└──────────┬──────────┘
           │ Keywords-based Scraping
           ▼
┌─────────────────────┐
│ Cloud Functions     │
│ + Gemini 1.5 Pro    │
└──────────┬──────────┘
           │ Needs Extraction
           ▼
┌─────────────────────┐
│ Personal Notebook   │
│ + Timeline          │
└──────────┬──────────┘
           │ Zero-Entry Auto-Record
           ▼
┌─────────────────────┐
│ User Action Plans   │
└─────────────────────┘
```

## 📁 ファイル構成

```
AIM3-Vue-ADM/
├── src/
│   ├── components/
│   │   ├── DiscoveryPanel.vue      # AI Discovery UI
│   │   ├── NotebookView.vue        # 統合済み (Discovery機能追加)
│   │   ├── TimelineBlock.vue       # Timeline表示
│   │   └── MarkdownRenderer.vue    # Timeline対応済み
│   └── services/
│       └── discoveryService.js     # Discovery API client
├── backend/
│   └── functions/
│       └── discovery/
│           ├── index.js            # Cloud Function
│           └── package.json        # Dependencies
└── .env.discovery                  # 環境変数テンプレート
```

## 🚀 セットアップ

### Phase 1: フロントエンド (完了✅)

```bash
# 既に実装済み - 追加のインストール不要
npm run dev
```

Personal Notebookで **Discover** ボタンをクリックして使用開始。

### Phase 2: バックエンド (Cloud Functions)

```bash
# Cloud Functionディレクトリに移動
cd backend/functions/discovery

# 依存関係インストール
npm install

# ローカルテスト
npm start
# → http://localhost:8080 で起動

# デプロイ
gcloud functions deploy extractInsights \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id
```

### Phase 3: 環境変数設定

`.env` ファイルを作成:

```bash
cp .env.discovery .env
```

以下を設定:
```env
VITE_DISCOVERY_FUNCTION_URL=https://us-central1-your-project.cloudfunctions.net
```

## 💡 使い方

### 1. Discovery Panel を開く

Personal Notebookで **Discover** ボタン（紫ピンクのグラデーション）をクリック。

### 2. ターゲット設定

- **Platform**: Threads または Instagram を選択
- **Handle**: `@username` を入力
- **Keywords**: 3〜10個のキーワードを入力
  - 例: `AI`, `design`, `productivity`, `startup`, `learning`

### 3. 抽出開始

**Start AI Discovery** をクリック。

### 4. 結果確認

2〜3秒後、Notebookに新しいエントリーが自動追加されます：

```markdown
# AI Discovery Report

## 🎯 Detected Needs
1. Simplified Tooling: 複雑すぎるツールへの不満
2. Community Validation: ピアからの推薦を求めている
3. Strategic Direction: 次のステップへの不確実性
...

## 💡 Actionable Insights

### 1. Create a Curated Tool Guide
**Need**: AIツールの選択肢が多すぎる
**Action**: 個人用「必須ツール」リストを作成
**Timeline**: 今週 - 2時間のリサーチと文書化

### 2. Join Specialized Communities
...

## 📊 Timeline Suggestion

\`\`\`timeline
2026-02-17: ツールリサーチ開始 #research
2026-02-20: 最初のコミュニティ参加 #networking
2026-02-24: ツールガイド完成 #milestone
Now: Discovery Phase
\`\`\`
```

## 🎨 UI/UX特徴

- **既存デザイン維持**: Glassmorphism美学を完全保持
- **3ボタンシステム**: Write / Speak / **Discover**
- **グラデーションアイコン**: 紫→ピンクで視覚的に際立つ
- **モーダルUI**: 既存フローを邪魔しない
- **リアルタイムフィードバック**: ローディング状態を明示

## 🔧 技術スタック

### フロントエンド
- Vue 3 (Composition API)
- Lucide Vue Next (アイコン)
- Tailwind CSS (Glassmorphism)

### バックエンド
- Google Cloud Functions (Node.js 20)
- Vertex AI (Gemini 1.5 Pro)
- Cloud Run (オプション)

### AI
- **Model**: Gemini 1.5 Pro
- **System Instruction**: カスタムニーズ抽出プロンプト
- **Output**: Markdown形式（Notebook最適化）

## 📊 実装ロードマップ

### Phase 1: Zero-Entry ✅ (完了)
- FaceID自動ログイン (WebAuthn, Firebase)
- UI統合 (Discovery Panel)

### Phase 2: Data Gravity 🚧 (進行中)
- SNSスクレイピング (現在はMock)
- キーワードベースフィルタリング
- Cloud Functions デプロイ

### Phase 3: Intelligence 🔜 (次のステップ)
- Gemini 1.5 Pro統合
- Notebookへの自動記録
- Timeline自動生成

### Phase 4: Advanced Features 💡 (将来)
- リアルタイムモニタリング
- 定期的な自動抽出
- マルチアカウント対応
- カスタムプロンプトテンプレート

## 🧪 テスト

### モックデータでテスト (現在)

現在は `mockExtractInsights` を使用しているため、実際のSNS APIなしでテスト可能。

```javascript
// src/services/discoveryService.js
export async function mockExtractInsights({ platform, handle, keywords }) {
  // 2秒後にモック結果を返す
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, insights: "..." };
}
```

### 本番APIに切り替え

Cloud Functionデプロイ後、`NotebookView.vue` で:

```javascript
// Mock版
const result = await mockExtractInsights(params);

// 本番版に変更
import { extractInsights } from '../services/discoveryService';
const result = await extractInsights(params);
```

## 🔐 セキュリティ

- **API Key**: 環境変数で管理
- **CORS**: Cloud Functionで適切に設定
- **認証**: Firebase Authと統合可能
- **レート制限**: Cloud Functionsで実装推奨

## 📈 パフォーマンス

- **抽出時間**: 2〜5秒（投稿数による）
- **コスト**: Gemini 1.5 Pro API使用量に依存
- **スケーラビリティ**: Cloud Functionsで自動スケール

## 🎯 次のステップ

1. **Cloud Functionデプロイ**
   ```bash
   cd backend/functions/discovery
   npm run deploy
   ```

2. **Instagram/Threads API統合**
   - Instagram Graph API設定
   - Threads API（利用可能時）

3. **本番環境テスト**
   - 実際のSNSデータで検証
   - プロンプトチューニング

4. **高度な機能追加**
   - 定期実行（Cloud Scheduler）
   - 複数アカウント監視
   - カスタムプロンプト

## 📚 参考資料

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Guide](https://ai.google.dev/docs)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Cloud Functions Guide](https://cloud.google.com/functions/docs)

---

**作成日**: 2026-02-17  
**バージョン**: 1.0.0  
**ステータス**: ✅ フロントエンド完了 | 🚧 バックエンド準備中
