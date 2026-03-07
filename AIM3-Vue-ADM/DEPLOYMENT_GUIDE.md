# ☁️ AIM3 Cloud Run Deployment Guide

このガイドは、AIM3 (Antigravity Interface) を Google Cloud Run にデプロイし、スケーラブルな自律エージェント基盤を公開するための手順を説明します。

## 🏗️ 構成
- **Frontend**: Vue 3 + Vite / Tailwind CSS
- **Server**: Nginx (Containerized)
- **Runtime**: Google Cloud Run (Fully Managed)
- **Build**: Google Cloud Build (Serverless Build)

## 📋 事前準備
1. **Google Cloud SDK (gcloud)** がインストールされていること
2. アカウントでログイン済みであること: `gcloud auth login`
3. プロジェクトが作成されていること

## 🚀 デプロイ手順 (自動化)

### Windows の場合
プロジェクトのルートディレクトリで以下のバッチファイルを実行してください。
```cmd
deploy-cloud-run.bat
```

### 手動コマンド (Step-by-Step)

1. **プロジェクトの設定**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **イメージのビルドとプッシュ (Cloud Build)**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aim3-portal .
   ```

3. **デプロイ**
   ```bash
   gcloud run deploy aim3-portal \
     --image gcr.io/YOUR_PROJECT_ID/aim3-portal \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080
   ```

## ⚙️ 環境変数の管理

Cloud Run では、ブラウザから見える `.env` ファイルの代わりに、デプロイ時に環境変数を注入することを推奨します。

```bash
gcloud run deploy aim3-portal \
  --set-env-vars VITE_FIREBASE_API_KEY=...,VITE_DISCOVERY_FUNCTION_URL=...
```

## 🔐 セキュリティ設定

### Firebase の設定
デプロイした Cloud Run の URL を、Firebase Console の **"Authorized Domains"** に追加してください。追加しないと WebRTC や Auth が動作しません。

1. [Firebase Console](https://console.firebase.google.com/) > Settings > Authentication
2. Settings タブ > Authorized domains
3. `your-service-xyz-uc.a.run.app` を追加

## 🛠️ トラブルシューティング

### 画面が真っ白になる (Routing Error)
Nginx が SPA のルーティングを適切に処理できていない可能性があります。`nginx.conf` の `try_files` 行を確認してください。

### P2P 通話が繋がらない
- ブラウザの WebRM (Media) 権限を確認してください。
- Firewall やプロキシが UDP 通信をブロックしていないか確認してください（STUNサーバーが解決します）。

---

**構築日**: 2026-02-17  
**Version**: 1.0.0
