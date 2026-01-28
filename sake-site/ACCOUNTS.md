# 🔐 Tài Khoản Test - Lang Sake

## 📝 Danh Sách Tài Khoản

### 1. 👑 ADMIN (Quản Trị Viên)
- **Email:** admin@langsake.vn
- **Password:** admin123
- **Tên:** Admin Lang Sake
- **Dashboard:** /dashboard/admin
- **Quyền:** Quản lý toàn bộ hệ thống, xác nhận/hủy booking, xem thống kê doanh thu

---

### 2. 🤝 F1 PARTNER (Đối Tác Chiến Lược)

#### Partner 1 - Nguyễn Văn Quyết
- **Email:** partner1@company.com
- **Password:** partner123
- **Tên:** Nguyễn Văn Quyết
- **Mã giới thiệu:** PARTNER001
- **Hoa hồng:** 10%
- **Dashboard:** /dashboard/f1
- **Quyền:** Xem đơn hàng từ F2 do mình giới thiệu, xem hoa hồng
- **Chức năng:** Quản lý F2 members và tracking doanh thu từ họ

#### Partner 2 - Trần Thị Hương
- **Email:** partner2@company.com
- **Password:** partner123
- **Tên:** Trần Thị Hương
- **Mã giới thiệu:** PARTNER002
- **Hoa hồng:** 10%
- **Dashboard:** /dashboard/f1
- **Quyền:** Xem đơn hàng từ F2 do mình giới thiệu, xem hoa hồng
- **Chức năng:** Quản lý F2 members và tracking doanh thu từ họ

---

### 3. ⭐ F2 MEMBER (Thành Viên)

#### Member 1 (GOLD)
- **Email:** member1@gmail.com
- **Password:** member123
- **Tên:** Nguyễn Văn A
- **Mã giới thiệu:** MEMBER001
- **Giảm giá:** 10%
- **Cấp độ:** GOLD
- **Được giới thiệu bởi:** Partner 1
- **Dashboard:** /dashboard/f2
- **Quyền:** Tự đặt bàn với ưu đãi thành viên

#### Member 2 (VIP)
- **Email:** member2@gmail.com
- **Password:** member123
- **Tên:** Trần Thị B
- **Mã giới thiệu:** MEMBER002
- **Giảm giá:** 15%
- **Cấp độ:** VIP
- **Được giới thiệu bởi:** Partner 2
- **Dashboard:** /dashboard/f2
- **Quyền:** Tự đặt bàn với ưu đãi thành viên

---

### 4. 👤 CUSTOMER (Khách Hàng)

- **Email:** customer1@gmail.com
- **Password:** customer123
- **Tên:** Lê Văn C
- **Dashboard:** /dashboard/customer (nếu có)
- **Quyền:** Xem booking của mình

---

## 🔄 Cách Test

1. **Logout** tài khoản hiện tại
2. **Login** bằng 1 trong các tài khoản trên
3. Hệ thống sẽ tự động redirect đến dashboard phù hợp

## 🐛 Debug

- **Debug Cookies:** http://localhost:3000/debug-cookies
- **Login Page:** http://localhost:3000/login
- **Home:** http://localhost:3000

## ⚠️ Lưu Ý

- Tất cả password đều **chưa được hash** (plain text) - cần implement bcrypt sau
- Cookie timeout: **8 giờ**
- Khi đăng nhập, hệ thống tự động set 3 cookies:
  - `sake_role`: admin / f1 / f2 / customer
  - `sake_user_id`: UUID của user
  - `sake_user_email`: Email của user
