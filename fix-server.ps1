# HealTrack Server Fix Script
Write-Host "🔧 Fixing HealTrack server issues..." -ForegroundColor Cyan

# Step 1: Clean cache
Write-Host "🧹 Cleaning build cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Start dev server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev
