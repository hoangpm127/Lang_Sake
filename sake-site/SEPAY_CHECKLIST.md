# ✅ Checklist Cấu hình Sepay

## 1. Đăng nhập Dashboard
- [ ] Đã đăng nhập https://my.sepay.vn
- [ ] Tài khoản đã xác thực email/số điện thoại

## 2. Liên kết ngân hàng
- [ ] Đã thêm tài khoản TPBank (34522229999)
- [ ] Tài khoản đã được xác thực (status: Active/Verified)
- [ ] Có thể xem lịch sử giao dịch

## 3. API Settings
- [ ] Đã tìm thấy menu "API" hoặc "Developer"
- [ ] API đã được KÍCH HOẠT (status: Active)
- [ ] Đã thanh toán phí API (100K/tháng)
- [ ] API Key hiển thị: `VPXRNYIGPRKBUJ9G0QPAW8CTQ4FOX4OV1S8SBTKTMKQV7XW5CW3UM2YL6AKNPHLI`

## 4. Webhook Configuration
- [ ] Đã tìm thấy phần "Webhook Settings"
- [ ] Đã copy WEBHOOK SECRET (⚠️ QUAN TRỌNG - khác với API Key)
- [ ] Đã cấu hình Webhook URL (nếu có sẵn)

## 5. API Documentation
- [ ] Đã tìm thấy link "API Documentation"
- [ ] Đã xem danh sách endpoints có sẵn
- [ ] Đã biết base URL chính xác (ví dụ: https://api.sepay.vn hoặc https://my.sepay.vn/api)

## 6. Permissions/Scopes
- [ ] API có quyền đọc giao dịch (Read Transactions)
- [ ] API có quyền đọc thông tin tài khoản (Read Account)
- [ ] Không có giới hạn IP (hoặc đã thêm IP của server)

---

## 📝 Thông tin cần lấy:

### Từ trang API Settings, ghi lại:
1. **Webhook Secret**: `_________________________________`
2. **Base URL API**: `_________________________________`
3. **Example Endpoint**: `_________________________________`

### Từ trang Documentation:
4. **Endpoint lấy danh sách giao dịch**: `_________________________________`
5. **Endpoint lấy thông tin tài khoản**: `_________________________________`

---

## ❓ Nếu không tìm thấy:

### Nếu không có menu "API":
- Liên hệ support Sepay qua:
  - Email: support@sepay.vn
  - Hotline: (số điện thoại trên website)
  - Live chat trên website

### Câu hỏi gợi ý cho support:
```
Xin chào,

Tôi đã đăng ký tài khoản Sepay và muốn sử dụng API để tự động xác nhận thanh toán.

Vui lòng hướng dẫn tôi:
1. Cách kích hoạt API (đã có API key)
2. Base URL và endpoints để gọi API
3. Cách lấy webhook secret
4. Link tài liệu API đầy đủ

API Key của tôi: VPXRNYIGPRKBUJ9G0QPAW8CTQ4FOX...

Cảm ơn!
```

---

## 🧪 Test API sau khi có đầy đủ thông tin:

Sau khi lấy được **Base URL chính xác** từ documentation, update file test:

```bash
cd d:\Lang_Sake\sake-site
# Update BASE_URL trong test-sepay-api.js
# Chạy lại test
node test-sepay-api.js
```
