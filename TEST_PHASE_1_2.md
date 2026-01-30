# 🧪 TEST CHECKLIST - PHASE 1 & 2

## ✅ PHASE 1: SECURITY & CRITICAL FIXES

### 1️⃣ **Password Hashing với Bcrypt**

#### Test 1.1: Login với password đúng
- [ ] Truy cập: http://localhost:3000/login
- [ ] Chọn tab "QUẢN TRỊ"
- [ ] Email: `admin@langsake.vn`
- [ ] Password: `admin123`
- [ ] Click "Đăng nhập"
- [ ] **Expected**: Redirect đến `/dashboard/admin` ✅
- [ ] **Expected**: Không có lỗi ❌

#### Test 1.2: Login với password sai
- [ ] Logout (nếu đang login)
- [ ] Login: `admin@langsake.vn` / `wrongpassword`
- [ ] **Expected**: Hiện lỗi "Mật khẩu không chính xác" ❌
- [ ] **Expected**: Không cho phép login ✅

#### Test 1.3: Kiểm tra password đã hash trong database
- [ ] Mở: `D:\Lang_Sake\sake-site\prisma\dev.db` bằng DB viewer
- [ ] Xem bảng `User`, cột `password`
- [ ] **Expected**: Thấy hash kiểu `$2a$10$...` (60 ký tự) ✅
- [ ] **Expected**: KHÔNG thấy plain text như "admin123" ❌

---

### 2️⃣ **Zod Validation**

#### Test 2.1: Email validation
- [ ] Truy cập: http://localhost:3000/login
- [ ] Nhập email sai: `notanemail`
- [ ] Password: `admin123`
- [ ] Click "Đăng nhập"
- [ ] **Expected**: Hiện lỗi "Email không hợp lệ" ❌

#### Test 2.2: Password length validation
- [ ] Email: `admin@langsake.vn`
- [ ] Password: `123` (quá ngắn)
- [ ] Click "Đăng nhập"
- [ ] **Expected**: Hiện lỗi "Mật khẩu phải có ít nhất 6 ký tự" ❌

#### Test 2.3: Phone validation (trong BookingForm)
- [ ] Truy cập: http://localhost:3000/booking
- [ ] Điền form nhưng phone: `abc123` (không phải số)
- [ ] Submit form
- [ ] **Expected**: Hiện lỗi "Số điện thoại phải có 10 chữ số" ❌

#### Test 2.4: Phone validation với số không đủ 10
- [ ] Phone: `090123` (chỉ 6 số)
- [ ] Submit form
- [ ] **Expected**: Hiện lỗi "Số điện thoại phải có 10 chữ số" ❌

#### Test 2.5: Phone validation đúng
- [ ] Phone: `0901234567` (đúng 10 số)
- [ ] Submit form
- [ ] **Expected**: Pass validation, không lỗi phone ✅

---

### 3️⃣ **Complete CRUD API**

#### Test 3.1: GET /api/bookings/[id]
- [ ] Login as admin
- [ ] Vào dashboard, copy ID của 1 booking
- [ ] Mở: http://localhost:3000/api/bookings/[ID]
- [ ] **Expected**: Trả về JSON với booking details ✅

#### Test 3.2: PUT /api/bookings/[id] (Admin only)
- [ ] Login as admin
- [ ] Vào dashboard
- [ ] Tìm booking PENDING
- [ ] Click "Xác nhận"
- [ ] Click "Xác nhận" trong dialog
- [ ] **Expected**: Status đổi thành CONFIRMED ✅
- [ ] **Expected**: Toast "Cập nhật trạng thái thành công!" ✅

#### Test 3.3: DELETE /api/bookings/[id] (Soft delete)
- [ ] Login as admin
- [ ] Tìm booking PENDING
- [ ] Click "Hủy"
- [ ] Click "Hủy booking" trong dialog
- [ ] **Expected**: Status đổi thành CANCELLED ✅
- [ ] **Expected**: Booking vẫn còn trong list (soft delete) ✅

---

## ✅ PHASE 2: CORE FEATURES

### 4️⃣ **Toast Notification System**

#### Test 4.1: Toast success
- [ ] Login as admin
- [ ] Xác nhận 1 booking
- [ ] **Expected**: Thấy toast xanh lá ở góc trên phải ✅
- [ ] **Expected**: Text: "Cập nhật trạng thái thành công!" ✅
- [ ] **Expected**: Tự động biến mất sau 3-5 giây ✅
- [ ] **Expected**: Có nút X để đóng ✅

#### Test 4.2: Toast error
- [ ] Đặt bàn với phone không đúng format
- [ ] Submit
- [ ] **Expected**: Thấy toast đỏ ở góc trên phải ❌
- [ ] **Expected**: Text: "Số điện thoại phải có 10 chữ số" ❌

#### Test 4.3: Multiple toasts
- [ ] Click nhanh nhiều action (confirm, cancel, etc)
- [ ] **Expected**: Các toast xếp chồng lên nhau ✅
- [ ] **Expected**: Không che mất nhau ✅

---

### 5️⃣ **Confirmation Dialog**

#### Test 5.1: Dialog xuất hiện
- [ ] Login as admin
- [ ] Click "Xác nhận" trên booking PENDING
- [ ] **Expected**: Hiện dialog overlay mờ ✅
- [ ] **Expected**: Title: "Xác nhận booking?" ✅
- [ ] **Expected**: Description chi tiết ✅
- [ ] **Expected**: 2 buttons: "Hủy" và "Xác nhận" ✅

#### Test 5.2: Dialog cancel
- [ ] Click "Xác nhận" trên booking
- [ ] Click "Hủy" trong dialog
- [ ] **Expected**: Dialog đóng ✅
- [ ] **Expected**: Không update status ✅

#### Test 5.3: Dialog confirm
- [ ] Click "Xác nhận" trên booking
- [ ] Click "Xác nhận" trong dialog
- [ ] **Expected**: Dialog đóng ✅
- [ ] **Expected**: Status được update ✅
- [ ] **Expected**: Toast success hiện ra ✅

#### Test 5.4: Dialog backdrop click
- [ ] Mở dialog
- [ ] Click vào vùng mờ bên ngoài dialog
- [ ] **Expected**: Dialog đóng ✅

#### Test 5.5: Dialog loading state
- [ ] Click "Xác nhận"
- [ ] Quan sát button trong dialog
- [ ] **Expected**: Text đổi thành "Đang xử lý..." ⏳
- [ ] **Expected**: Button disabled ✅

---

### 6️⃣ **Admin Booking Management**

#### Test 6.1: PENDING → CONFIRMED
- [ ] Login as admin
- [ ] Tìm booking status PENDING (màu vàng)
- [ ] Click button "Xác nhận" (xanh dương, icon ✓)
- [ ] Confirm trong dialog
- [ ] **Expected**: Status → CONFIRMED (xanh dương) ✅
- [ ] **Expected**: Buttons đổi thành "Hoàn thành" ✅

#### Test 6.2: PENDING → CANCELLED
- [ ] Tìm booking PENDING
- [ ] Click button "Hủy" (đỏ, icon ×)
- [ ] Confirm trong dialog
- [ ] **Expected**: Status → CANCELLED (đỏ) ✅
- [ ] **Expected**: Buttons biến mất, hiện "Đã xử lý" ✅

#### Test 6.3: CONFIRMED → COMPLETED
- [ ] Tìm booking CONFIRMED
- [ ] Click button "Hoàn thành" (xanh lá, icon ✓ circle)
- [ ] Confirm trong dialog
- [ ] **Expected**: Status → COMPLETED (xanh lá) ✅
- [ ] **Expected**: Buttons biến mất, hiện "Đã xử lý" ✅

#### Test 6.4: Icons hiển thị đúng
- [ ] PENDING bookings có 2 buttons với icons:
  - [ ] "Xác nhận" có icon ✓ (FaCheck)
  - [ ] "Hủy" có icon × (FaTimes)
- [ ] CONFIRMED bookings có 1 button:
  - [ ] "Hoàn thành" có icon ✓◯ (FaCheckCircle)

#### Test 6.5: Multiple updates
- [ ] Update nhiều bookings liên tiếp
- [ ] **Expected**: Mỗi booking update độc lập ✅
- [ ] **Expected**: Không conflict với nhau ✅

---

### 7️⃣ **DateTimePicker Component**

#### Test 7.1: Date picker hiển thị
- [ ] Truy cập: http://localhost:3000/booking
- [ ] Scroll đến "Thời gian đặt bàn"
- [ ] **Expected**: Thấy 2 input riêng biệt: "Ngày" và "Giờ" ✅
- [ ] **Expected**: Không phải input datetime-local native ✅

#### Test 7.2: Chọn date
- [ ] Click vào input "Ngày"
- [ ] **Expected**: Hiện calendar picker ✅
- [ ] Chọn ngày 5/2/2026
- [ ] **Expected**: Date được set ✅

#### Test 7.3: Chọn time
- [ ] Click vào input "Giờ"
- [ ] **Expected**: Hiện time picker ✅
- [ ] Chọn 19:00
- [ ] **Expected**: Time được set ✅

#### Test 7.4: Preview datetime
- [ ] Sau khi chọn cả date và time
- [ ] **Expected**: Hiện preview bên dưới ✅
- [ ] **Expected**: Format: "📅 Thứ Năm, 5 tháng 2, 2026 lúc 19:00" ✅
- [ ] **Expected**: Tiếng Việt ✅

#### Test 7.5: Không cho chọn quá khứ
- [ ] Click vào input "Ngày"
- [ ] Thử chọn ngày trước hôm nay
- [ ] **Expected**: Các ngày quá khứ bị disabled ❌
- [ ] **Expected**: Chỉ chọn được từ hôm nay trở đi ✅

#### Test 7.6: Validation datetime
- [ ] Để trống datetime
- [ ] Submit form
- [ ] **Expected**: Hiện lỗi validation ❌

---

### 8️⃣ **Improved BookingForm**

#### Test 8.1: Form layout
- [ ] Truy cập: http://localhost:3000/booking
- [ ] **Expected**: DateTimePicker full width (md:col-span-2) ✅
- [ ] **Expected**: Responsive trên mobile ✅

#### Test 8.2: Toast on success
- [ ] Điền form đầy đủ và đúng
- [ ] Submit
- [ ] **Expected**: Toast xanh "Đặt bàn thành công!" ✅
- [ ] **Expected**: Success screen với ✅ ✅

#### Test 8.3: Toast on error
- [ ] Điền form với phone sai
- [ ] Submit
- [ ] **Expected**: Toast đỏ với error message ❌
- [ ] **Expected**: Error hiện trong form ❌

---

## 🔍 REGRESSION TESTS

### 9️⃣ **Các chức năng cũ vẫn hoạt động**

#### Test 9.1: Register vẫn hoạt động
- [ ] Truy cập: http://localhost:3000/login
- [ ] Tab "THÀNH VIÊN"
- [ ] Click "Đăng ký"
- [ ] Điền form với email mới
- [ ] **Expected**: Đăng ký thành công ✅
- [ ] **Expected**: Password được hash ✅

#### Test 9.2: F1 Dashboard vẫn hoạt động
- [ ] Login: `partner1@company.com` / `partner123`
- [ ] **Expected**: Redirect đến `/dashboard/f1` ✅
- [ ] **Expected**: Thấy bookings của F2 members ✅
- [ ] **Expected**: Thấy hoa hồng ✅

#### Test 9.3: F2 Dashboard vẫn hoạt động
- [ ] Login: `member1@gmail.com` / `member123`
- [ ] **Expected**: Redirect đến `/dashboard/f2` ✅
- [ ] **Expected**: Thấy bookings cá nhân ✅
- [ ] **Expected**: Thấy discount/savings ✅

#### Test 9.4: Middleware vẫn bảo vệ routes
- [ ] Logout
- [ ] Thử truy cập: http://localhost:3000/dashboard/admin
- [ ] **Expected**: Redirect đến `/login` ✅
- [ ] **Expected**: Query param `?error=unauthorized` ✅

---

## 🎯 FINAL CHECKS

### 🔟 **Production Readiness**

#### Test 10.1: No console errors
- [ ] Mở DevTools Console (F12)
- [ ] Navigate qua các pages
- [ ] **Expected**: Không có console errors ❌
- [ ] **Expected**: Warning về middleware là OK (Next.js issue) ⚠️

#### Test 10.2: Build success
```bash
cd d:\Lang_Sake\sake-site
npm run build
```
- [ ] **Expected**: Build thành công không lỗi ✅

#### Test 10.3: TypeScript check
```bash
npx tsc --noEmit
```
- [ ] **Expected**: No TypeScript errors ✅

---

## 📊 TEST SUMMARY

### ✅ Must Pass (Critical):
- [ ] Password hashing hoạt động
- [ ] Login với password đúng/sai
- [ ] Validation chặn input sai
- [ ] Admin có thể update booking status
- [ ] Toast notifications hiển thị
- [ ] Confirmation dialogs hoạt động

### 🟡 Should Pass (Important):
- [ ] DateTimePicker đẹp và dễ dùng
- [ ] Icons hiển thị đúng
- [ ] Multiple toasts không conflict
- [ ] Backward compatibility (F1, F2 dashboards)

### 🟢 Nice to Have:
- [ ] Animations mượt
- [ ] Responsive design hoàn hảo
- [ ] No console warnings

---

## 🚀 READY TO COMMIT?

Sau khi check hết các mục trên:

```bash
# Add tất cả changes
git add .

# Commit
git commit -m "feat: implement Phase 1 & 2 - Security + Core Features

Phase 1: Security & Critical Fixes
- ✅ Password hashing với bcryptjs
- ✅ Input validation với Zod
- ✅ Complete CRUD API cho bookings
- ✅ Fix security vulnerabilities

Phase 2: Core Features
- ✅ Toast notification system (sonner)
- ✅ Confirmation dialogs
- ✅ Admin booking management UI
- ✅ DateTimePicker component
- ✅ Improved BookingForm với better UX"

# Push to GitHub
git push origin main
```

---

**Timestamp:** 2026-01-30
**Phase:** 1 & 2 Complete
**Status:** Ready for Testing
