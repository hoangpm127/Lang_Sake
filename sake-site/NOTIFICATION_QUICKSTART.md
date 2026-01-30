# 🚀 Quick Start - Email & Zalo Notifications

## Setup trong 5 phút

### 1. Copy .env.example sang .env
```bash
cp .env.example .env
```

### 2. Setup Email (Gmail)

**Bước 1:** Bật 2-Step Verification
- Vào: https://myaccount.google.com/security
- Bật "2-Step Verification"

**Bước 2:** Tạo App Password
- Vào: https://myaccount.google.com/apppasswords
- App: Mail, Device: Other (nhập "Lang Sake")
- Copy password (16 ký tự)

**Bước 3:** Update .env
```env
EMAIL_USER=booking@langsake.vn
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 3. Test Email
```bash
# Mở browser
http://localhost:3000/api/test/email
```

Nếu thành công → Email sẽ được gửi tới EMAIL_USER

### 4. Setup Zalo OA (Optional)

**Nếu chưa có Zalo OA:**
- Vào https://oa.zalo.me/ → Đăng ký
- Chờ phê duyệt 1-2 ngày

**Nếu đã có Zalo OA:**
1. Vào https://developers.zalo.me/
2. Tạo app → Liên kết OA
3. Copy Access Token
4. Update .env:
```env
ZALO_ACCESS_TOKEN=your-long-token-here
```

### 5. Test Zalo
```bash
# Mở browser (thay số điện thoại của bạn)
http://localhost:3000/api/test/zalo?phone=0901234567
```

---

## Notification Flow

```
Customer đặt bàn
    ↓
Tạo booking thành công
    ↓
┌─────────────┬─────────────┐
│   Email     │   Zalo OA   │
│ (nếu có)    │  (async)    │
└─────────────┴─────────────┘
    ↓
Customer nhận thông báo với mã booking
    ↓
Có thể tra cứu tại /booking/lookup
```

---

## Features

### ✅ Email Template
- HTML email đẹp với branding Lang Sake
- Hiển thị mã booking (8 ký tự)
- Chi tiết booking đầy đủ
- Button "Tra cứu đơn hàng"
- Responsive mobile

### ✅ Zalo OA Message
- Text message ngắn gọn
- Mã booking
- Thông tin cơ bản
- Link tra cứu

### ✅ Error Handling
- Notification fail → booking vẫn thành công
- Log error để admin biết
- Customer vẫn nhận mã trên web UI

---

## Troubleshooting

### Email không gửi được?

**Check .env:**
```bash
# In terminal
echo $EMAIL_USER
echo $EMAIL_PASSWORD
```

**Check Gmail settings:**
- 2-Step Verification đã bật chưa?
- App Password đã tạo chưa?
- Copy đúng 16 ký tự?

**Check logs:**
```bash
# Xem console khi test
npm run dev
# Mở http://localhost:3000/api/test/email
# Xem output trong terminal
```

### Zalo không gửi được?

**Kiểm tra:**
- [ ] ZALO_ACCESS_TOKEN đã set trong .env?
- [ ] Token còn hạn không? (check Zalo Developer Console)
- [ ] Phone number đã follow OA chưa?
- [ ] OA đã được verify chưa?

---

## Production Deployment

### Email
1. Tạo email chuyên dụng: booking@langsake.vn
2. Setup App Password
3. Update .env.production
4. Test trước khi deploy

### Zalo OA
1. Verify Zalo OA
2. Tạo template messages (optional)
3. Test với follower thật
4. Monitor quota (Zalo có giới hạn số tin/ngày)

### Monitoring
- Setup error alerts (email/Slack)
- Monitor notification success rate
- Track email open rate (optional: use tracking pixel)
- Monitor Zalo OA follower count

---

## Next Steps

- [ ] Customize email template với logo/branding
- [ ] Add QR code vào email
- [ ] Setup Zalo template messages
- [ ] Add SMS fallback (Twilio/AWS SNS)
- [ ] Analytics: track notification success rate
