# 🚀 HƯỚNG DẪN DEPLOY VÀ BÀN GIAO - Lang Sake

> **Ngày tạo:** 01/02/2026  
> **Phiên bản:** 1.0.0  
> **Trạng thái:** Sẵn sàng Production 🟢

---

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Yêu Cầu Trước Khi Deploy](#-yêu-cầu-trước-khi-deploy)
3. [Hướng Dẫn Deploy Vercel](#-hướng-dẫn-deploy-vercel)
4. [Cấu Hình Environment Variables](#-cấu-hình-environment-variables)
5. [Cấu Hình Database](#-cấu-hình-database)
6. [Cấu Hình Domain](#-cấu-hình-domain)
7. [Sau Khi Deploy](#-sau-khi-deploy)
8. [Xử Lý Sự Cố](#-xử-lý-sự-cố)
9. [Bảo Trì & Vận Hành](#-bảo-trì--vận-hành)

---

## 📖 Tổng Quan Dự Án

### Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | Next.js 16 |
| Database | PostgreSQL (Vercel Postgres) |
| ORM | Prisma |
| Styling | TailwindCSS |
| Email | Gmail SMTP (Nodemailer) |
| Payment | VietQR + Sepay Webhook |
| Hosting | Vercel |

### Tính Năng Chính

- ✅ Hệ thống đặt bàn (Booking)
- ✅ Thanh toán QR Code tự động
- ✅ Quản lý đối tác F1/F2
- ✅ Hoa hồng 2 tầng
- ✅ Email thông báo tự động
- ✅ Dashboard Analytics

---

## ✅ Yêu Cầu Trước Khi Deploy

### Tài Khoản Cần Thiết

| Tài khoản | Link đăng ký | Mục đích |
|-----------|--------------|----------|
| **Vercel** | [vercel.com](https://vercel.com) | Hosting & Database |
| **GitHub** | [github.com](https://github.com) | Source code |
| **Gmail** | [gmail.com](https://gmail.com) | Email notifications |
| **Sepay** | [sepay.vn](https://sepay.vn) | Payment webhook (~100K/tháng) |

### Thông Tin Cần Chuẩn Bị

- [ ] Số tài khoản ngân hàng + Mã BIN ngân hàng
- [ ] Gmail App Password (không phải mật khẩu gmail thường)
- [ ] Domain tùy chỉnh (nếu có)

---

## 🌐 Hướng Dẫn Deploy Vercel

### Bước 1: Import Repository

1. Truy cập [vercel.com/new](https://vercel.com/new)
2. Kết nối GitHub account
3. Chọn repository `Lang_Sake`
4. Click **Import**

### Bước 2: Cấu Hình Build

Vercel tự động nhận diện Next.js. Kiểm tra:
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

> [!NOTE]
> File `vercel.json` đã được cấu hình sẵn với build command.

### Bước 3: Deploy Lần Đầu

1. Click **Deploy** (sẽ fail do chưa có database - bình thường)
2. Tiếp tục cấu hình database theo bước dưới

---

## 🔐 Cấu Hình Environment Variables

### Truy cập: Vercel Dashboard → Settings → Environment Variables

### Biến Bắt Buộc

```env
# Database (tự động có sau khi tạo Vercel Postgres)
DATABASE_URL=postgresql://...

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
ADMIN_EMAIL=admin@langsake.vn

# Bank Info
NEXT_PUBLIC_BANK_BIN=970436
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=1234567890123
NEXT_PUBLIC_BANK_ACCOUNT_NAME=CONG TY LANG SAKE

# App URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Payment Webhook
SEPAY_API_KEY=your-sepay-api-key
```

### Biến Tùy Chọn

```env
# Zalo OA
ZALO_ACCESS_TOKEN=your-token

# Session
SESSION_SECRET=random-secret-key
```

### Cách Lấy Gmail App Password

1. Vào [myaccount.google.com/security](https://myaccount.google.com/security)
2. Bật **2-Step Verification**
3. Vào [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Chọn **Mail** → **Other** → Đặt tên "Lang Sake"
5. Copy mật khẩu 16 ký tự

---

## 🗄️ Cấu Hình Database (Supabase)

### Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com)
2. Click **New Project**
3. Đặt tên project: `langsake`
4. Chọn region: **Southeast Asia (Singapore)**
5. Đặt mật khẩu database (lưu lại!)
6. Click **Create new project**

### Lấy Connection String

1. Trong Supabase Dashboard → **Settings** → **Database**
2. Cuộn xuống **Connection string** → chọn tab **URI**
3. Copy connection string, có dạng:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

> [!IMPORTANT]
> Thay `[password]` bằng mật khẩu bạn đã đặt khi tạo project.

### Thêm vào Vercel Environment Variables

1. Vercel Dashboard → Settings → Environment Variables
2. Thêm biến `DATABASE_URL` với giá trị là connection string ở trên
3. Chọn áp dụng cho **Production**, **Preview**, và **Development**

**Cách 2: Dùng Vercel Deploy Hook**

Sau khi deploy, truy cập:
```
https://your-app.vercel.app/api/migrate
```

### Tài Khoản Mặc Định (sau khi seed)

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@langsake.vn | Admin123!@# |
| F1 Partner | f1@langsake.vn | F1partner123!@# |
| F2 Member | f2@langsake.vn | F2member123!@# |

---

## 🌍 Cấu Hình Domain

### Thêm Custom Domain

1. Vercel Dashboard → **Settings** → **Domains**
2. Nhập domain: `langsake.vn`
3. Click **Add**

### Cấu Hình DNS

Thêm record tại nhà cung cấp domain:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

> [!TIP]
> DNS propagation mất 10-30 phút. Kiểm tra tại [dnschecker.org](https://dnschecker.org)

### Cập Nhật Environment

Sau khi domain hoạt động, cập nhật:
```env
NEXT_PUBLIC_BASE_URL=https://langsake.vn
```

---

## ✅ Sau Khi Deploy

### Checklist Kiểm Tra

- [ ] Trang chủ load đúng
- [ ] Đăng nhập/đăng ký hoạt động
- [ ] Tạo booking thành công
- [ ] QR code thanh toán hiển thị
- [ ] Email gửi thành công
- [ ] Dashboard admin truy cập được

### Cấu Hình Sepay Webhook

1. Đăng nhập [sepay.vn](https://sepay.vn)
2. Vào **Cài đặt** → **Webhook**
3. Thêm URL:
   ```
   https://your-domain.com/api/webhooks/payment
   ```
4. Lưu và test

### Test Health Check

```bash
curl https://your-domain.com/api/health
```

Kết quả mong đợi:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

## 🐛 Xử Lý Sự Cố

### Build Failed

**Nguyên nhân:** Lỗi TypeScript hoặc thiếu dependencies

**Giải pháp:**
```bash
# Test local trước
npm run build

# Fix lỗi, commit, push
git add .
git commit -m "Fix build"
git push
```

### Database Connection Failed

**Nguyên nhân:** `DATABASE_URL` sai hoặc database chưa tạo

**Giải pháp:**
1. Kiểm tra Vercel Postgres đã tạo
2. Kiểm tra `DATABASE_URL` trong Environment Variables
3. Redeploy

### Email Không Gửi

**Nguyên nhân:** Sai App Password hoặc chưa bật 2FA

**Giải pháp:**
1. Kiểm tra Gmail đã bật 2-Step Verification
2. Tạo lại App Password
3. Cập nhật `EMAIL_PASSWORD`

### Webhook 404

**Nguyên nhân:** URL webhook sai

**Giải pháp:**
1. Kiểm tra URL: `https://domain.com/api/webhooks/payment`
2. Không có dấu `/` ở cuối
3. Test với curl

---

## 🔧 Bảo Trì & Vận Hành

### Backup Database

```bash
# Export dữ liệu
vercel postgres backup

# Hoặc dùng pg_dump
pg_dump $DATABASE_URL > backup.sql
```

### Monitoring

- **Vercel Analytics:** Dashboard → Analytics (miễn phí)
- **Logs:** Dashboard → Logs (xem real-time)
- **Errors:** Dashboard → Functions → Errors

### Update Code

```bash
git add .
git commit -m "Update feature X"
git push origin main
# Vercel tự động deploy
```

### Rollback

1. Dashboard → Deployments
2. Chọn deployment cũ
3. Click "..." → **Promote to Production**

---

## 💰 Chi Phí Ước Tính

| Dịch vụ | Chi phí | Ghi chú |
|---------|---------|---------|
| Vercel (Hobby) | **Miễn phí** | Đủ cho traffic nhỏ |
| Vercel Postgres | ~$0.25/GB | Tính theo dung lượng |
| Sepay | ~100K VND/tháng | Webhook tự động |
| Domain | ~$12/năm | Tùy chọn |
| **Tổng** | **~$3-5/tháng** | |

---

## 📞 Liên Hệ Hỗ Trợ

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs:** [prisma.io/docs](https://prisma.io/docs)

---

## 📝 Changelog

| Ngày | Phiên bản | Thay đổi |
|------|-----------|----------|
| 01/02/2026 | 1.0.0 | Initial release |

---

**🎉 Chúc deploy thành công!**
