# Script khởi động toàn bộ hệ thống development

Write-Host "`n🚀 KHỞI ĐỘNG HỆ THỐNG DEVELOPMENT`n" -ForegroundColor Cyan

# 1. Khởi động ngrok
Write-Host "📡 [1/2] Khởi động ngrok tunnel..." -ForegroundColor Yellow
& "$PSScriptRoot\start-ngrok.ps1"

Start-Sleep -Seconds 3

# 2. Khởi động Next.js server
Write-Host "`n⚡ [2/2] Khởi động Next.js server..." -ForegroundColor Yellow
Write-Host "Server sẽ chạy tại: http://localhost:3000`n" -ForegroundColor Cyan

Set-Location $PSScriptRoot
npm run dev
