#!/bin/bash

# AIM3 AI Discovery Engine - Deployment Script
# This script deploys the Cloud Function for Instagram/Threads needs extraction

echo "🚀 AIM3 AI Discovery Engine - Deployment"
echo "========================================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Error: Not logged in to gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No project set"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project: $PROJECT_ID"
echo ""

# Navigate to function directory
cd backend/functions/discovery || exit 1

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Deploying Cloud Function..."
echo "   Function: extractInsights"
echo "   Runtime: nodejs20"
echo "   Region: us-central1"
echo ""

gcloud functions deploy extractInsights \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID \
  --memory 512MB \
  --timeout 60s

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📍 Function URL:"
    gcloud functions describe extractInsights --region us-central1 --format="value(httpsTrigger.url)"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Copy the Function URL above"
    echo "2. Update .env file:"
    echo "   VITE_DISCOVERY_FUNCTION_URL=<Function URL>"
    echo "3. Restart your dev server: npm run dev"
    echo ""
else
    echo ""
    echo "❌ Deployment failed"
    echo "Please check the error messages above"
    exit 1
fi
