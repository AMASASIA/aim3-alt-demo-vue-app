# AIM3 AI Discovery - System Architecture

## 全体フロー

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│                  (Personal Notebook)                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐         │
│  │  Write   │  │  Speak   │  │    Discover      │         │
│  │  ✍️      │  │  🎤      │  │  ✨ (NEW!)      │         │
│  └──────────┘  └──────────┘  └────────┬─────────┘         │
│                                        │                    │
└────────────────────────────────────────┼────────────────────┘
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │  Discovery Panel       │
                            │  (Modal UI)            │
                            │                        │
                            │  • Platform Select     │
                            │  • Handle Input        │
                            │  • Keywords (3-10)     │
                            │  • Start Button        │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │  discoveryService.js   │
                            │  (Frontend Service)    │
                            │                        │
                            │  • API Client          │
                            │  • Mock Data (Dev)     │
                            │  • Response Parser     │
                            └───────────┬────────────┘
                                        │
                                        │ HTTP POST
                                        ▼
┌───────────────────────────────────────────────────────────────┐
│                   CLOUD INFRASTRUCTURE                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Cloud Functions (Node.js 20)                       │    │
│  │  Endpoint: /extractInsights                         │    │
│  │                                                      │    │
│  │  1. Receive Request                                 │    │
│  │     { platform, handle, keywords }                  │    │
│  │                                                      │    │
│  │  2. Scrape Social Media                             │    │
│  │     ┌──────────────────────────────────┐            │    │
│  │     │  Instagram/Threads API           │            │    │
│  │     │  • Filter by keywords            │            │    │
│  │     │  • Get recent posts              │            │    │
│  │     │  • Extract metadata              │            │    │
│  │     └──────────────────────────────────┘            │    │
│  │                                                      │    │
│  │  3. AI Analysis                                     │    │
│  │     ┌──────────────────────────────────┐            │    │
│  │     │  Vertex AI (Gemini 1.5 Pro)     │            │    │
│  │     │                                  │            │    │
│  │     │  System Instruction:            │            │    │
│  │     │  "高度なインサイト抽出エージェント"  │            │    │
│  │     │                                  │            │    │
│  │     │  Analysis Framework:            │            │    │
│  │     │  1. SCAN   (投稿特定)           │            │    │
│  │     │  2. DECODE (行間を読む)         │            │    │
│  │     │  3. PREDICT (次のニーズ予測)    │            │    │
│  │     │  4. SYNTHESIZE (アクションプラン) │            │    │
│  │     │                                  │            │    │
│  │     │  Output: Markdown Report        │            │    │
│  │     └──────────────────────────────────┘            │    │
│  │                                                      │    │
│  │  4. Return Response                                 │    │
│  │     {                                               │    │
│  │       success: true,                                │    │
│  │       insights: "# AI Discovery Report...",         │    │
│  │       postsAnalyzed: 3,                             │    │
│  │       metadata: {...}                               │    │
│  │     }                                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ JSON Response
                                ▼
                    ┌────────────────────────┐
                    │  Frontend Processing   │
                    │                        │
                    │  • Parse Response      │
                    │  • Extract Timeline    │
                    │  • Create Entry        │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │  Notebook Entry        │
                    │  (Auto-Created)        │
                    │                        │
                    │  📝 Title              │
                    │  🎯 Detected Needs     │
                    │  💡 Action Plans       │
                    │  📊 Timeline           │
                    │  🏷️  Metadata          │
                    └────────────────────────┘
```

## データフロー詳細

### 1. User Input
```javascript
{
  platform: "threads",
  handle: "username",
  keywords: ["AI", "design", "productivity", "startup", "learning"]
}
```

### 2. Cloud Function Processing
```javascript
// Scrape posts
const posts = await scrapeSocialMedia(platform, handle, keywords);
// posts = [
//   { text: "...", timestamp: "...", likes: 42, comments: 8 },
//   ...
// ]

// AI Analysis
const insights = await extractInsightsWithGemini(posts, keywords, handle);
```

### 3. Gemini Prompt
```
Analyze the following social media posts from @username.

Keywords to focus on: AI, design, productivity, startup, learning

Posts:
Post 1 (2026-02-15):
"Just finished a new design project! Really excited about AI..."
Engagement: 42 likes, 8 comments

Task:
1. Identify latent needs
2. Predict what they will need NEXT
3. Generate 3 actionable insights
4. Create a timeline suggestion
```

### 4. AI Response
```markdown
# AI Discovery Report

## 🎯 Detected Needs
1. Simplified Tooling
2. Community Validation
3. Strategic Direction
...

## 💡 Actionable Insights

### 1. Create a Curated Tool Guide
**Need**: Overwhelmed by complex AI tools
**Action**: Build personal "Essential Tools" list
**Timeline**: This week - 2 hours research

...

## 📊 Timeline Suggestion

\`\`\`timeline
2026-02-17: Start Tool Research #research
2026-02-20: Join First Community #networking
...
\`\`\`
```

### 5. Notebook Entry
```javascript
{
  id: "1708156800000",
  type: "discovery",
  title: "AI Discovery: @username",
  content: "# AI Discovery Report...",
  timestamp: "2026-02-17T12:00:00Z",
  metadata: {
    platform: "threads",
    handle: "username",
    keywords: ["AI", "design", ...],
    postsAnalyzed: 3,
    source: "ai_discovery",
    verification_hash: "a1b2c3d4"
  }
}
```

## コンポーネント間の通信

```
DiscoveryPanel.vue
    │
    │ emit('extract-insights', params)
    ▼
NotebookView.vue
    │
    │ handleExtractInsights(params)
    ▼
discoveryService.js
    │
    │ mockExtractInsights(params) [Dev]
    │ extractInsights(params)      [Prod]
    ▼
Cloud Functions
    │
    │ POST /extractInsights
    ▼
Vertex AI (Gemini)
    │
    │ generateContent(prompt)
    ▼
Response
    │
    │ { success, insights, ... }
    ▼
NotebookView.vue
    │
    │ parseInsightsToNotebookEntry()
    │ emit('save-diary', content, entry)
    ▼
App.vue / Parent
    │
    │ entries.unshift(newEntry)
    ▼
Notebook Display
```

## セキュリティ層

```
┌─────────────────────────────────────┐
│  Frontend (Browser)                 │
│  • API Key は環境変数で管理          │
│  • HTTPS通信のみ                    │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│  Cloud Functions                    │
│  • CORS設定                         │
│  • レート制限 (推奨)                 │
│  • Firebase Auth統合 (オプション)    │
└──────────────┬──────────────────────┘
               │ Internal
               ▼
┌─────────────────────────────────────┐
│  Vertex AI                          │
│  • GCP IAM認証                      │
│  • プロジェクト内部通信              │
└─────────────────────────────────────┘
```

## スケーラビリティ

```
User Load: 1 → 1000 → 10000
    │          │         │
    ▼          ▼         ▼
Cloud Functions (Auto-scale)
    │          │         │
    ▼          ▼         ▼
Vertex AI (Managed Service)
```

## コスト構造

```
1回のDiscovery実行:
├─ Cloud Functions: ~$0.0001
├─ Vertex AI (Gemini): ~$0.01-0.05
└─ Total: ~$0.01-0.05

月間100回実行: ~$1-5
月間1000回実行: ~$10-50
```

## AIM3: Primal Interface & AI Orchestrator Core Architecture

### 1. Primal Interface (UI/UX)
- **Voice-First**: Primary interaction via natural language.
- **Floating Concept**: Interface adapts to context, not bound to fixed screens.
- **Notebook Centric**: All interactions are semantic records in the Personal Notebook.

### 2. AI Orchestrator (Gemini 2.0)
The central intelligence that interprets "Will" and coordinates services.
- **Intent Analysis**: Deep natural language understanding.
- **Task Decomposition**: Breaking complex requests into sub-tasks (e.g., Calendar + Mail).
- **RAG (Semantic Index)**: Retrieving relevant user context from vector storage.

### 3. Serverless & P2P Fusion
- **Firebase Realtime DB**: For serverless signaling.
- **WebRTC**: Peer-to-peer data and media flow.
- **Edge AI**: Local processing for low latency and privacy.

---

**作成日**: 2026-02-20
**バージョン**: 2.0.0 (Primal Vision Update)
