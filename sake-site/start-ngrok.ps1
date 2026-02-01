# Script tự động khởi động ngrok và hiển thị thông tin

Write-Host "`n🚀 Đang khởi động ngrok tunnel..." -ForegroundColor Cyan

# Kiểm tra xem ngrok đã chạy chưa
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "⚠️  Ngrok đã đang chạy. Đang dừng process cũ..." -ForegroundColor Yellow
    Stop-Process -Name "ngrok" -Force
    Start-Sleep -Seconds 2
}

# Khởi động ngrok
Start-Process -FilePath "ngrok" -ArgumentList "http", "3000" -WindowStyle Hidden

# Đợi ngrok khởi động
Write-Host "⏳ Đang đợi ngrok khởi động..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Lấy thông tin tunnel
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
    $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq "https" }
    
    if ($httpsTunnel) {
        $url = $httpsTunnel.public_url
        $webhookUrl = "$url/api/webhooks/payment"
        
        Write-Host "`n✅ NGROK ĐANG CHẠY THÀNH CÔNG!`n" -ForegroundColor Green
        Write-Host "📌 Public URL: " -NoNewline -ForegroundColor Cyan
        Write-Host $url -ForegroundColor White
        Write-Host "📌 Webhook URL: " -NoNewline -ForegroundColor Cyan
        Write-Host $webhookUrl -ForegroundColor White
        
        # Copy webhook URL vào clipboard
        Set-Clipboard -Value $webhookUrl
        Write-Host "`n✅ Webhook URL đã được copy vào clipboard!" -ForegroundColor Green
        
        Write-Host "`n📝 BẠN CẦN LÀM:" -ForegroundColor Yellow
        Write-Host "1. Vào Sepay Dashboard: https://my.sepay.vn/userv2/settings/webhook" -ForegroundColor White
        Write-Host "2. Chỉnh sửa webhook ID 23252" -ForegroundColor White
        Write-Host "3. Dán URL mới (đã copy): $webhookUrl" -ForegroundColor White
        Write-Host "4. Lưu lại`n" -ForegroundColor White
        
        # Mở ngrok dashboard
        Write-Host "🌐 Mở ngrok dashboard tại: http://127.0.0.1:4040`n" -ForegroundColor Cyan
        Start-Process "http://127.0.0.1:4040"
        
    } else {
        Write-Host "❌ Không tìm thấy HTTPS tunnel" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Lỗi khi lấy thông tin tunnel: $_" -ForegroundColor Red
    Write-Host "💡 Hãy đợi thêm vài giây và thử lại" -ForegroundColor Yellow
}
