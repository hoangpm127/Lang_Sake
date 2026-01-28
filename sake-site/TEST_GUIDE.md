# 🧪 HƯỚNG DẪN TEST HỆ THỐNG

## ✅ ĐÃ HOÀN THÀNH

### 1. **Database Schema - User & Relationships**
- ✅ User model với 4 vai trò: ADMIN, F1_PARTNER, F2_MEMBER, CUSTOMER
- ✅ Booking model với tracking nguồn, người tạo, referral code
- ✅ Commission model cho hoa hồng F1
- ✅ Relationships đầy đủ giữa User - Booking - Commission

### 2. **Seed Data**
Đã tạo dữ liệu mẫu:
- 1 Admin
- 2 F1 Partners (có mã giới thiệu & hoa hồng)
- 2 F2 Members (có discount)
- 1 Customer
- 4 Bookings từ nhiều nguồn khác nhau

### 3. **Authentication System**
- ✅ Login bằng email/password
- ✅ Phân quyền theo role
- ✅ Cookie-based sessions

### 4. **Booking API**
- ✅ POST: Tạo booking với tracking đầy đủ
- ✅ GET: Lấy bookings theo role
- ✅ Tự động tính hoa hồng cho F1
- ✅ Tự động tính discount cho F2
- ✅ Tracking referral code

### 5. **Dashboard Components**
- ✅ AdminDashboard: Xem tất cả bookings
- ✅ F1Dashboard: Xem bookings của mình + hoa hồng
- ✅ F2Dashboard: Xem bookings cá nhân + tiết kiệm

---

## 🧪 TEST SCENARIOS

### **Test 1: Login Admin**
1. Mở: http://localhost:3000/login
2. Chọn tab "QUẢN TRỊ"
3. Login:
   - Email: `admin@langsake.vn`
   - Password: `admin123`
4. ✅ Redirect đến `/dashboard/admin`
5. ✅ Thấy tất cả 4 bookings
6. ✅ Thấy thống kê: doanh thu, bookings theo nguồn

### **Test 2: Login F1 Partner**
1. Logout (nếu đang login)
2. Chọn tab "ĐỐI TÁC CHIẾN LƯỢC"
3. Login:
   - Email: `partner1@company.com`
   - Password: `partner123`
4. ✅ Redirect đến `/dashboard/f1`
5. ✅ Chỉ thấy 1 booking (do F1 này tạo)
6. ✅ Thấy hoa hồng: 200,000 VND (10% của 2,000,000)

### **Test 3: Login F2 Member**
1. Logout
2. Chọn tab "THÀNH VIÊN"
3. Login:
   - Email: `member1@gmail.com`
   - Password: `member123`
4. ✅ Redirect đến `/dashboard/f2`
5. ✅ Chỉ thấy 1 booking (của chính mình)
6. ✅ Thấy discount: 150,000 VND (10% discount)

### **Test 4: Tạo Booking (Admin)**
1. Login as Admin
2. **TODO**: Cần thêm form tạo booking
3. Tạo booking cho khách walk-in
4. ✅ Booking có source = ADMIN_CREATE
5. ✅ Tracking createdById = admin.id

### **Test 5: Tạo Booking (F1)**
1. Login as F1 Partner
2. **TODO**: Cần thêm form tạo booking
3. Tạo booking cho khách
4. ✅ Booking có source = F1_CREATE
5. ✅ Tự động tạo commission record
6. ✅ Update totalCommission của F1

### **Test 6: Tạo Booking (F2)**
1. Login as F2 Member
2. **TODO**: Cần thêm form tạo booking
3. Đặt bàn cho chính mình
4. ✅ Booking có source = F2_SELF
5. ✅ Có discount theo membershipLevel
6. ✅ customerId = F2.id

---

## 📊 DATABASE VERIFICATION

### Kiểm tra dữ liệu:

```bash
cd sake-site
npx prisma studio
```

Trong Prisma Studio:
1. ✅ Xem bảng `User` - 6 users
2. ✅ Xem bảng `Booking` - 4 bookings
3. ✅ Xem bảng `Commission` - 1 commission
4. ✅ Verify relationships

---

## 🔐 TEST ACCOUNTS

| Role | Email | Password | Mã giới thiệu |
|------|-------|----------|---------------|
| Admin | admin@langsake.vn | admin123 | - |
| F1 Partner 1 | partner1@company.com | partner123 | PARTNER001 |
| F1 Partner 2 | partner2@company.com | partner123 | PARTNER002 |
| F2 Member 1 | member1@gmail.com | member123 | MEMBER001 |
| F2 Member 2 | member2@gmail.com | member123 | MEMBER002 |
| Customer | customer1@gmail.com | customer123 | - |

---

## 🚀 NEXT STEPS

### Cần làm tiếp:

1. **🔴 HIGH PRIORITY:**
   - [ ] Add booking creation forms (Admin/F1/F2)
   - [ ] Implement password hashing (bcrypt)
   - [ ] Add booking status update (Confirm/Cancel/Complete)
   - [ ] Add commission payment tracking
   - [ ] Add user management UI (Admin tạo F1, F2)

2. **🟡 MEDIUM PRIORITY:**
   - [ ] Add referral code display for F1/F2
   - [ ] Add booking filters & search
   - [ ] Add date range picker for bookings
   - [ ] Add export reports (CSV/Excel)
   - [ ] Add email notifications

3. **🟢 LOW PRIORITY:**
   - [ ] Add charts & analytics
   - [ ] Add dashboard customization
   - [ ] Add user profile management
   - [ ] Add activity logs

---

## 🎯 FLOW HOẠT ĐỘNG

### **Flow 1: Khách đặt trực tiếp trên Web**
```
Khách → Đặt bàn trên web → Nhập mã giới thiệu (optional)
→ Booking tạo với source=WEB_DIRECT
→ Nếu có mã F2: tính discount
→ Nếu khách đã login: gán customerId
```

### **Flow 2: F1 tạo booking cho khách**
```
F1 login → Dashboard F1 → Tạo booking
→ Booking với source=F1_CREATE, createdById=F1.id
→ Tự động tạo commission (10-15%)
→ Update totalCommission của F1
```

### **Flow 3: F2 tự đặt cho mình**
```
F2 login → Dashboard F2 → Đặt bàn
→ Booking với source=F2_SELF, customerId=F2.id
→ Tự động tính discount theo discountRate
→ discountReason = "F2_MEMBER"
```

### **Flow 4: Admin tạo cho khách walk-in**
```
Admin login → Dashboard Admin → Tạo booking
→ Booking với source=ADMIN_CREATE, createdById=Admin.id
→ Không discount, không commission
→ Có thể thêm internalNotes
```

---

## ✅ CHECKLIST HOÀN THIỆN

- [x] Database schema
- [x] Migrations & seed
- [x] Authentication API
- [x] Booking API (POST/GET)
- [x] Dashboard views
- [x] Role-based access
- [x] Commission calculation
- [x] Discount calculation
- [ ] Booking forms
- [ ] Password hashing
- [ ] User management
- [ ] Status updates
- [ ] Reports & analytics

---

## 📝 NOTES

### Quan trọng:
1. **Password hiện tại là plain text** - CẦN hash ngay
2. **Booking forms chưa có** - cần tạo UI
3. **Admin chưa thể quản lý users** - cần CRUD
4. **Commission chưa có payment tracking** - cần thêm

### Performance:
- Database là SQLite - OK cho development
- Production nên chuyển PostgreSQL
- Cần add indexes cho queries thường dùng

### Security:
- Implement rate limiting
- Add CSRF protection  
- Hash passwords với bcrypt
- Validate all inputs
- Add error logging
