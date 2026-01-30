# Hướng dẫn cấu hình thanh toán QR Code - Phase 2

## Tổng quan

Phase 2 tích hợp VietQR với webhook tự động xác nhận thanh toán từ Casso.vn hoặc Sepay.vn.

### Cách hoạt động:
1. Khách hàng chọn "Đặt cọc trước 10%"
2. Hệ thống hiển thị QR code thanh toán
3. Khách quét mã và chuyển tiền qua app banking
4. Casso/Sepay nhận giao dịch và gửi webhook về server
5. Server tự động xác nhận booking và gửi thông báo

---

## Bước 1: Cấu hình ngân hàng

### 1.1. Chuẩn bị thông tin ngân hàng

Bạn cần có:
- ✅ Số tài khoản ngân hàng
- ✅ Tên chủ tài khoản
- ✅ Mã BIN ngân hàng (xem danh sách bên dưới)

### 1.2. Danh sách mã BIN các ngân hàng Việt Nam

| Ngân hàng | Mã BIN | Tên đầy đủ |
|-----------|--------|-----------|
| VCB | 970436 | Vietcombank |
| TCB | 970407 | Techcombank |
| VPB | 970432 | VPBank |
| TPB | 970423 | TPBank |
| MB | 970422 | MB Bank |
| ACB | 970416 | ACB |
| BIDV | 970418 | BIDV |
| Agribank | 970405 | Agribank |

### 1.3. Cập nhật file `.env`

```env
NEXT_PUBLIC_BANK_BIN=970436  # Mã BIN ngân hàng của bạn
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=0123456789  # Số tài khoản
NEXT_PUBLIC_BANK_ACCOUNT_NAME=LANG SAKE  # Tên chủ TK (VIẾT HOA)
```

---

## Bước 2: Đăng ký dịch vụ webhook

Bạn có 2 lựa chọn: **Casso.vn** hoặc **Sepay.vn**

### Option A: Casso.vn (Khuyến nghị)

**Ưu điểm:**
- Hỗ trợ nhiều ngân hàng
- Giao diện đẹp, dễ dùng
- Hỗ trợ kỹ thuật tốt
- Webhook realtime (< 5 giây)

**Chi phí:** ~200,000 VND/tháng

**Hướng dẫn:**

1. Đăng ký tại: https://casso.vn

2. Thêm tài khoản ngân hàng:
   - Vào menu "Tài khoản ngân hàng"
   - Nhập thông tin đăng nhập internet banking
   - Casso sẽ kết nối và theo dõi giao dịch

3. Lấy API Key:
   - Vào menu "Cài đặt" → "API"
   - Copy "API Key" và "Webhook Secret"

4. Cấu hình webhook URL:
   - Webhook URL: `https://yourdomain.com/api/webhooks/payment`
   - Header: `x-provider: casso`
   - Method: POST
   - **Lưu ý:** Domain phải public (không dùng localhost)

5. Cập nhật `.env`:
```env
CASSO_API_KEY=AK-...
CASSO_WEBHOOK_SECRET=your-webhook-secret
```

### Option B: Sepay.vn

**Ưu điểm:**
- Giá rẻ hơn Casso
- Hỗ trợ đa dạng ngân hàng
- API đơn giản

**Chi phí:** ~100,000 VND/tháng

**Hướng dẫn:**

1. Đăng ký tại: https://sepay.vn

2. Thêm tài khoản ngân hàng:
   - Vào "Quản lý tài khoản"
   - Liên kết tài khoản ngân hàng

3. Lấy API Key:
   - Vào "Cài đặt API"
   - Copy "API Key" và "Webhook Secret"

4. Cấu hình webhook:
   - URL: `https://yourdomain.com/api/webhooks/payment`
   - Header: `x-provider: sepay`

5. Cập nhật `.env`:
```env
SEPAY_API_KEY=your-api-key
SEPAY_WEBHOOK_SECRET=your-webhook-secret
```

---

## Bước 3: Expose localhost ra internet (Development)

Trong môi trường development (localhost), webhook không thể gọi được vì không có IP public.

### Option 1: Ngrok (Miễn phí)

```bash
# Cài đặt ngrok
choco install ngrok  # Windows
brew install ngrok   # Mac

# Đăng ký tài khoản tại: https://ngrok.com

# Chạy ngrok
ngrok http 3000

# Ngrok sẽ cung cấp URL public, VD: https://abc123.ngrok.io
# Dùng URL này để cấu hình webhook
```

### Option 2: Localtunnel (Miễn phí)

```bash
npx localtunnel --port 3000
```

### Option 3: Deploy lên Vercel/Railway (Production)

Deploy app lên môi trường production để có domain public thật sự.

---

## Bước 4: Test webhook

### 4.1. Test endpoint

```bash
# Kiểm tra webhook endpoint có hoạt động không
curl https://yourdomain.com/api/webhooks/payment

# Response mong đợi:
{
  "message": "Payment webhook endpoint is active",
  "timestamp": "2026-01-30T..."
}
```

### 4.2. Test giao dịch thật

1. Tạo booking mới với đặt cọc
2. Quét QR code và chuyển tiền
3. Kiểm tra console log của server:
   ```
   [Webhook] Received payment webhook
   [Webhook] Processing transaction
   [Webhook] Found booking ID: clxxxx
   [Webhook] Booking updated successfully
   ```
4. Booking tự động chuyển sang CONFIRMED

---

## Bước 5: Xử lý lỗi thường gặp

### Lỗi 1: Webhook không được gọi

**Nguyên nhân:**
- URL không public (localhost)
- Firewall chặn incoming requests
- SSL certificate không hợp lệ

**Giải pháp:**
- Dùng ngrok hoặc deploy production
- Kiểm tra firewall settings
- Dùng Let's Encrypt cho SSL

### Lỗi 2: Signature verification failed

**Nguyên nhân:**
- Webhook secret sai
- Request bị modify bởi proxy

**Giải pháp:**
- Kiểm tra lại `CASSO_WEBHOOK_SECRET` hoặc `SEPAY_WEBHOOK_SECRET`
- Tắt signature verification trong development:
  ```typescript
  if (!isValid && process.env.NODE_ENV === 'production') {
    // Only verify in production
  }
  ```

### Lỗi 3: Booking không tìm thấy

**Nguyên nhân:**
- Nội dung chuyển khoản bị thay đổi
- Format không đúng

**Giải pháp:**
- Kiểm tra regex parse trong `/api/webhooks/payment/route.ts`
- Xem log `description` trong webhook payload

---

## Bước 6: Monitoring & Logs

### 6.1. Kiểm tra logs

Tất cả webhook requests được log ra console:

```typescript
[Webhook] Received payment webhook { provider: 'casso', ... }
[Webhook] Processing transaction { amount: 66600, description: 'LANGSAKE B123 WEB' }
[Webhook] Found booking ID: clxxxx
[Webhook] Booking updated successfully: clxxxx
```

### 6.2. Dashboard Casso/Sepay

- Vào dashboard của Casso/Sepay
- Xem "Lịch sử webhook" để debug
- Kiểm tra status code response (200 = success)

---

## Bước 7: Production Checklist

- [ ] Cấu hình đầy đủ biến environment
- [ ] Test webhook với giao dịch thật
- [ ] Bật signature verification (`NODE_ENV=production`)
- [ ] Setup monitoring (Sentry, LogRocket...)
- [ ] Cấu hình email notification cho admin khi có deposit
- [ ] Test error handling (giao dịch trùng, số tiền sai...)
- [ ] Backup database định kỳ
- [ ] Document quy trình hoàn tiền (nếu cần)

---

## Support

Nếu gặp vấn đề:
1. Kiểm tra console logs
2. Xem webhook history trong Casso/Sepay dashboard
3. Test với Postman/curl để debug
4. Liên hệ support của Casso/Sepay

---

## Chi phí ước tính

| Dịch vụ | Chi phí/tháng | Ghi chú |
|---------|---------------|---------|
| Casso.vn | 200,000 VND | Khuyến nghị |
| Sepay.vn | 100,000 VND | Giá rẻ hơn |
| Ngrok Pro | $8 USD (~200K) | Nếu cần custom domain |
| Hosting | Miễn phí | Vercel/Railway free tier |

**Tổng:** ~100-200K VND/tháng
