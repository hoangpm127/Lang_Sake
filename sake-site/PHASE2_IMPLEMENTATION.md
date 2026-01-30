# Phase 2 - VietQR + Webhook Auto Payment Implementation

## ✅ Đã hoàn thành

### 1. Database Schema Updates
- ✅ Thêm các trường tracking thanh toán vào Booking model:
  - `depositPaidAt` - Thời gian thanh toán
  - `depositTransferContent` - Nội dung chuyển khoản
  - `depositSource` - Nguồn (WEB/F2 referral code)
  - `paymentQRCode` - URL QR code
  - `paymentBankRef` - Mã tham chiếu từ ngân hàng
- ✅ Migration: `20260130131306_add_payment_tracking`

### 2. VietQR Generator
File: `src/lib/vietqr.ts`
- ✅ Hỗ trợ tất cả ngân hàng Việt Nam (BANK_BINS)
- ✅ Generate QR code sử dụng API img.vietqr.io
- ✅ Format nội dung: `LANGSAKE B{bookingId} {source}`
- ✅ Parse nội dung để extract booking ID
- ✅ Helper function `generateBookingQRCode()`

### 3. Webhook Payment Handler
File: `src/app/api/webhooks/payment/route.ts`
- ✅ POST endpoint nhận webhook từ Casso.vn và Sepay.vn
- ✅ Signature verification (HMAC SHA-256)
- ✅ Parse transaction data từ cả 2 providers
- ✅ Tìm booking theo transfer content
- ✅ Validate số tiền (tolerance ±1%)
- ✅ Auto-confirm booking khi nhận tiền
- ✅ Prevent double payment
- ✅ Comprehensive logging

### 4. BookingForm UI Updates
File: `src/components/booking/BookingForm.tsx`
- ✅ Hiển thị QR code khi check "Đặt cọc trước 10%"
- ✅ Generate QR realtime với số tiền chính xác
- ✅ Responsive design với Image component
- ✅ Hướng dẫn thanh toán step-by-step
- ✅ Warning không thay đổi nội dung chuyển khoản
- ✅ useEffect hook tự động tạo QR khi hasDeposit=true

### 5. Environment Configuration
Files: `.env`, `.env.example`
- ✅ NEXT_PUBLIC_BANK_BIN
- ✅ NEXT_PUBLIC_BANK_ACCOUNT_NUMBER
- ✅ NEXT_PUBLIC_BANK_ACCOUNT_NAME
- ✅ CASSO_API_KEY & CASSO_WEBHOOK_SECRET
- ✅ SEPAY_API_KEY & SEPAY_WEBHOOK_SECRET

### 6. Documentation
File: `PAYMENT_SETUP_GUIDE.md`
- ✅ Hướng dẫn cấu hình ngân hàng
- ✅ Danh sách mã BIN 8 ngân hàng lớn
- ✅ So sánh Casso vs Sepay
- ✅ Hướng dẫn đăng ký từng dịch vụ
- ✅ Setup webhook URL
- ✅ Expose localhost với ngrok/localtunnel
- ✅ Test webhook guide
- ✅ Troubleshooting common errors
- ✅ Production checklist
- ✅ Chi phí ước tính

---

## 📋 Cần làm tiếp (Optional)

### Admin Payment Dashboard (Future)
- [ ] Tab "Payments" trong AdminDashboard
- [ ] Danh sách bookings đang chờ thanh toán
- [ ] Manual confirmation cho trường hợp webhook fail
- [ ] Payment history với filter/search
- [ ] Refund handling

### Notifications (Future)
- [ ] Email thông báo khi nhận cọc
- [ ] Zalo notification cho khách hàng
- [ ] Thông báo F1/F2 khi có commission mới
- [ ] Admin alert khi có giao dịch mismatch

### Analytics (Future)
- [ ] Dashboard tracking deposit rate
- [ ] Payment success rate
- [ ] Average time to payment
- [ ] Revenue by payment method

---

## 🚀 Cách sử dụng

### 1. Cấu hình (Bắt buộc)

Trước tiên cần cấu hình thông tin ngân hàng trong `.env`:

```env
NEXT_PUBLIC_BANK_BIN=970436  # Mã BIN ngân hàng
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=0123456789
NEXT_PUBLIC_BANK_ACCOUNT_NAME=LANG SAKE
```

### 2. Đăng ký Casso hoặc Sepay

**Option A: Casso.vn** (Khuyến nghị)
- Đăng ký: https://casso.vn
- Chi phí: ~200K/tháng
- Webhook URL: `https://yourdomain.com/api/webhooks/payment`
- Header: `x-provider: casso`

**Option B: Sepay.vn** (Giá rẻ hơn)
- Đăng ký: https://sepay.vn
- Chi phí: ~100K/tháng
- Webhook URL: `https://yourdomain.com/api/webhooks/payment`
- Header: `x-provider: sepay`

Cập nhật API keys:
```env
CASSO_API_KEY=AK-...
CASSO_WEBHOOK_SECRET=xxx
```

### 3. Development với Ngrok

Vì localhost không có IP public, cần dùng ngrok:

```bash
ngrok http 3000
# Dùng HTTPS URL từ ngrok để cấu hình webhook
```

### 4. Test Flow

1. Vào trang booking
2. Chọn combo và điền thông tin
3. ✅ Check "Đặt cọc trước 10%"
4. QR code xuất hiện ngay bên dưới
5. Quét mã bằng app banking
6. Chuyển tiền (KHÔNG đổi nội dung)
7. Webhook tự động xác nhận sau vài giây
8. Booking status → CONFIRMED

---

## 🔍 Kiểm tra logs

Mở terminal server và xem:

```
[Webhook] Received payment webhook { provider: 'casso', ... }
[Webhook] Processing transaction { amount: 66600, description: 'LANGSAKE B123 WEB' }
[Webhook] Found booking ID: clxxxx
[Webhook] Booking updated successfully: clxxxx
```

---

## 🐛 Troubleshooting

### QR code không hiển thị
- Kiểm tra `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` trong .env
- Mở DevTools Console xem lỗi
- Verify Image component import

### Webhook không được gọi
- URL phải public (không dùng localhost trực tiếp)
- Kiểm tra webhook config trong Casso/Sepay dashboard
- Test endpoint: `curl https://yourdomain.com/api/webhooks/payment`

### Booking không auto-confirm
- Kiểm tra console logs
- Verify nội dung chuyển khoản có format đúng: `LANGSAKE B{id} {source}`
- Kiểm tra signature verification (tắt trong dev nếu cần)

---

## 📊 Technical Details

### QR Code Format
API: `https://img.vietqr.io/image/{BIN}-{ACCOUNT}-{TEMPLATE}.png`
Params:
- `amount`: Số tiền (VND)
- `addInfo`: Nội dung chuyển khoản
- `accountName`: Tên chủ tài khoản

### Transfer Content Format
```
LANGSAKE B{bookingId} {source}
```

Examples:
- `LANGSAKE B123 WEB` - Khách đặt trực tiếp
- `LANGSAKE BABC F2XYZ` - Qua F2 referral

### Webhook Signature
```typescript
HMAC-SHA256(payload, webhook_secret)
```

### Database Flow
```
1. User clicks "Đặt cọc 10%"
2. QR code displayed
3. User transfers money
4. Bank → Casso/Sepay
5. Casso/Sepay → POST /api/webhooks/payment
6. Parse transfer content → Find booking
7. Update: depositPaid=true, status=CONFIRMED
8. Log success
```

---

## 💰 Chi phí

| Item | Chi phí | Ghi chú |
|------|---------|---------|
| Casso.vn | 200K/tháng | Khuyến nghị |
| Sepay.vn | 100K/tháng | Giá rẻ |
| Ngrok Pro | $8/tháng | Optional |
| Hosting | Free | Vercel/Railway |

**Total: 100-200K VND/tháng**

---

## 📞 Support

Xem chi tiết trong `PAYMENT_SETUP_GUIDE.md`
