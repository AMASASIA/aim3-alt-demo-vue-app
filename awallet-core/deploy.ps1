$ErrorActionPreference = "Stop"

$PROJECT_ID = "gen-lang-client-0016726069"
$REGION = "us-central1"
$REPO_NAME = "awallet-repo"
$SERVICE_NAME = "awallet-service"
$PIMLICO_KEY = "pim_LojtYE6oa6HKyVsFFmsBQm"

$PRIVATE_KEY = ""
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match 'PRIVATE_KEY="?(0x[a-fA-F0-9]+)"?') {
            \(PRIVATE_KEY =\)matches[1]
        }
    }
}

Write-Host "=== 1. Google Cloud プロジェクト設定 ===" -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

Write-Host "=== 2. Artifact Registry リポジトリの確認・作成 ===" -ForegroundColor Cyan
\(repoCheck = gcloud artifacts repositories list --location=\)REGION --filter="name:$REPO_NAME" --format="value(name)"
if (-not $repoCheck) {
    Write-Host "リポジトリ $REPO_NAME を新規作成します..."
    gcloud artifacts repositories create \(REPO_NAME --repository-format=docker --location=\)REGION --description="AWallet Repo"
} else {
    Write-Host "リポジトリ $REPO_NAME は既に存在します。"
}

Write-Host "=== 3. Cloud Build によるコンテナイメージ作成 ===" -ForegroundColor Cyan
\(IMAGE_URI = "\){REGION}-docker.pkg.dev/\({PROJECT_ID}/\){REPO_NAME}/${SERVICE_NAME}:latest"
gcloud builds submit --tag $IMAGE_URI

Write-Host "=== 4. Cloud Run へデプロイ ===" -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --image $IMAGE_URI `
  --set-env-vars PIMLICO_API_KEY="\(PIMLICO_KEY",PRIVATE_KEY="\)PRIVATE_KEY" `
  --allow-unauthenticated `
  --region $REGION `
  --platform managed

Write-Host "=== 5. Firebase Hosting デプロイ (/api リライト) ===" -ForegroundColor Cyan
firebase deploy --only hosting

Write-Host "`n=== すべてのデプロイが完了しました ===" -ForegroundColor Green
