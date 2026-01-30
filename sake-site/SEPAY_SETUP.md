# Hướng dẫn đăng ký và cấu hình Sepay.vn

## Thông tin ngân hàng đã cấu hình

✅ **Ngân hàng:** TPBank  
✅ **Số tài khoản:** 34522229999  
✅ **Chủ tài khoản:** MAI VIỆT HOÀNG  
✅ **Mã BIN:** 970423

---

## Bước 1: Đăng ký tài khoản Sepay

### 1.1. Truy cập Sepay.vn
- Website: https://sepay.vn
- Click "Đăng ký" ở góc phải trên

### 1.2. Điền thông tin đăng ký
- Email (dùng email của công ty)
- Số điện thoại
- Mật khẩu
- Xác nhận qua email/SMS

### 1.3. Xác thực tài khoản
- Xác thực email
- Xác thực số điện thoại
- Đăng nhập lần đầu

---

## Bước 2: Liên kết tài khoản ngân hàng TPBank

### 2.1. Vào menu "Quản lý tài khoản"
- Click vào menu bên trái
- Chọn "Tài khoản ngân hàng"
- Click "Thêm tài khoản"

### 2.2. Điền thông tin TPBank
```
Ngân hàng: TPBank (Tien Phong Bank)
Số tài khoản: 34522229999
Tên chủ tài khoản: MAI VIỆT HOÀNG
```

### 2.3. Xác thực quyền sở hữu
Sepay có thể yêu cầu:
- **Option A:** Chuyển khoản số tiền nhỏ để xác thực (VD: 10,000 VND)
- **Option B:** Upload ảnh chụp sao kê ngân hàng
- **Option C:** Kết nối API trực tiếp (cần tài khoản doanh nghiệp)

**Khuyến nghị:** Dùng Option A (nhanh nhất)

---

## Bước 3: Lấy API Key và Webhook Secret

### 3.1. Vào "Cài đặt API"
- Menu bên trái → "Developer" hoặc "API"
- Click "Tạo API Key mới"

### 3.2. Copy API credentials
Bạn sẽ nhận được 2 giá trị:
1. **API Key** - Dùng để gọi API Sepay
2. **Webhook Secret** - Dùng để xác thực webhook

**⚠️ LƯU Ý:** Copy ngay và lưu ở nơi an toàn. Không được public API key!

### 3.3. Cập nhật vào `.env`
```env
SEPAY_API_KEY=AK_CS_xxxxxxxxxxxxxxxxxxxxxxxxx
SEPAY_WEBHOOK_SECRET=your-32-character-secret-here
```

---

## Bước 4: Cấu hình Webhook URL

### 4.1. Xác định Webhook URL

**Development (localhost):**
- Cần dùng ngrok hoặc localtunnel
- VD: `https://abc123.ngrok.io/api/webhooks/payment`

**Production:**
- Domain thật: `https://langsake.vn/api/webhooks/payment`

### 4.2. Cấu hình trong Sepay Dashboard

1. Vào "Webhook Settings"
2. Thêm webhook endpoint:
   ```
   URL: https://yourdomain.com/api/webhooks/payment
   Method: POST
   ```

3. Thêm custom header:
   ```
   Key: x-provider
   Value: sepay
   ```

4. Chọn sự kiện:
   - ✅ `transaction.created` (Giao dịch mới)
   - ✅ `transaction.completed` (Giao dịch hoàn thành)

5. Save và Test webhook

---

## Bước 5: Expose localhost (Development only)

### Option 1: Ngrok (Khuyến nghị)

```bash
# Cài đặt ngrok
choco install ngrok  # Windows
# hoặc tải từ: https://ngrok.com/download

# Đăng ký tài khoản miễn phí tại https://ngrok.com

# Chạy ngrok
ngrok http 3000

# Output:
# Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

Dùng URL `https://abc123.ngrok.io/api/webhooks/payment` để cấu hình webhook.

### Option 2: Localtunnel

```bash
npx localtunnel --port 3000

# Output:
# your url is: https://random-name.loca.lt
```

---

## Bước 6: Test webhook

### 6.1. Khởi động dev server

```bash
cd d:\Lang_Sake\sake-site
npm run dev
```

### 6.2. Chuyển khoản test

1. Mở app banking TPBank
2. Chuyển khoản **10,000 VND** đến TK: 34522229999
3. Nội dung: `TEST LANGSAKE B123 WEB`
4. Xác nhận chuyển

### 6.3. Kiểm tra logs

Mở terminal dev server và xem:
```
[Webhook] Received payment webhook { provider: 'sepay', ... }
[Webhook] Processing transaction { amount: 10000, description: 'TEST LANGSAKE B123 WEB' }
[Webhook] Found booking ID: 123
[Webhook] Booking updated successfully: 123
```

### 6.4. Kiểm tra Sepay Dashboard

- Vào "Webhook History"
- Xem request đã gửi thành công chưa
- Status code = 200 là OK

---

## Bước 7: Test flow hoàn chỉnh

### 7.1. Tạo booking thật

1. Vào http://localhost:3000/booking
2. Điền thông tin
3. Chọn combo
4. ✅ Check "Đặt cọc trước 10%"
5. QR code xuất hiện → **Chụp lại QR code**
6. Submit booking

### 7.2. Thanh toán qua QR

1. Mở app TPBank
2. Quét QR code vừa chụp
3. Kiểm tra:
   - Số tiền đúng (10% của total)
   - Nội dung: `LANGSAKE B{bookingId} WEB`
4. **KHÔNG thay đổi nội dung**
5. Xác nhận chuyển

### 7.3. Verify tự động

Trong vòng 5-10 giây:
- Sepay nhận giao dịch
- Gửi webhook về server
- Server tự động confirm booking
- Booking status → CONFIRMED

---

## Chi phí Sepay

| Gói | Giá | Ghi chú |
|-----|-----|---------|
| Starter | 100,000 VND/tháng | 1 tài khoản ngân hàng |
| Basic | 200,000 VND/tháng | 3 tài khoản ngân hàng |
| Pro | 500,000 VND/tháng | Unlimited, API nâng cao |

**Khuyến nghị:** Dùng gói Starter (100K/tháng) cho TPBank.

---

## Troubleshooting

### ❌ Webhook không được gọi

**Nguyên nhân:**
- URL localhost không public
- Webhook URL sai
- Firewall block

**Giải pháp:**
1. Kiểm tra ngrok đang chạy
2. Test webhook bằng Postman:
   ```bash
   curl -X POST https://yourdomain.com/api/webhooks/payment \
     -H "x-provider: sepay" \
     -H "x-signature: test" \
     -d '{}'
   ```
3. Xem Sepay webhook history để debug

### ❌ Booking không tự động confirm

**Nguyên nhân:**
- Nội dung chuyển khoản sai format
- Booking ID không match

**Giải pháp:**
1. Check console logs:
   ```
   [Webhook] Processing transaction { description: '...' }
   [Webhook] No booking ID found  // ← Lỗi ở đây
   ```
2. Verify regex parse trong `parseTransferContent()`
3. Đảm bảo format: `LANGSAKE B{id} {source}`

### ❌ Signature verification failed

**Nguyên nhân:**
- `SEPAY_WEBHOOK_SECRET` sai

**Giải pháp:**
1. Copy lại secret từ Sepay dashboard
2. Trong development, có thể tắt verify:
   ```typescript
   if (!isValid && process.env.NODE_ENV === 'production') {
     // Chỉ verify trong production
   }
   ```

---

## Checklist hoàn thành

- [ ] Đăng ký tài khoản Sepay
- [ ] Liên kết TK TPBank: 34522229999
- [ ] Lấy API Key và Webhook Secret
- [ ] Cập nhật `.env` file
- [ ] Cấu hình webhook URL
- [ ] Chạy ngrok (nếu localhost)
- [ ] Test chuyển khoản 10K
- [ ] Verify webhook logs
- [ ] Test booking flow hoàn chỉnh
- [ ] Deploy production (optional)

---

## Support Sepay

- **Website:** https://sepay.vn
- **Email:** support@sepay.vn
- **Hotline:** 1900-xxxx (check website)
- **Facebook:** fb.com/sepay.vn
- **Documentation:** https://docs.sepay.vn

---

## Next Steps

Sau khi cấu hình xong Sepay, bạn có thể:

1. **Thêm thông báo Email/Zalo** khi nhận cọc
2. **Admin dashboard** để quản lý payments
3. **Refund handling** cho trường hợp khách hủy
4. **Analytics** theo dõi deposit rate

Xem thêm trong `PAYMENT_SETUP_GUIDE.md` và `PHASE2_IMPLEMENTATION.md`.
