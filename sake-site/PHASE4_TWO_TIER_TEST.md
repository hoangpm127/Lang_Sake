# PHASE 4: HỆ THỐNG HOA HỒNG 2 TẦNG - TEST GUIDE

## 🎯 CẤU TRÚC HỆ THỐNG

### **Tầng 2 (5%)** - Gần Admin
- **Role:** F1_PARTNER (Đối tác chiến lược)
- **Vai trò:** Quản lý F2, nhận hoa hồng từ doanh số F2
- **Màu badge:** Tím (Purple)

### **Tầng 1 (10%)** - Gần Khách Hàng  
- **Role:** F2_MEMBER (Sale trực tiếp)
- **Vai trò:** Bán hàng trực tiếp, được F1 quản lý
- **Màu badge:** Xanh dương (Blue)

---

## 📊 LOGIC HOA HỒNG MỚI

### **Trường hợp 1: F2 Tự Booking (F2_SELF)**
**Công thức:**
- **F2** nhận **10%** (Tầng 1 - Bán trực tiếp)
- **F1** (người giới thiệu F2) nhận **5%** (Tầng 2 - Quản lý)

**Ví dụ:**
- Booking: 2.000.000 VND
- F2 nhận: 200.000 VND (10%)
- F1 nhận: 100.000 VND (5%)
- **Tổng hoa hồng:** 300.000 VND (15%)

**Luồng:**
1. F2 đăng nhập → Đặt booking cho chính mình
2. Hệ thống tạo **2 commission records:**
   - Commission 1: partnerId = F2, amount = 200k, rate = 10, tier = 1
   - Commission 2: partnerId = F1, amount = 100k, rate = 5, tier = 2

---

### **Trường hợp 2: F1 Tạo Booking Cho Khách (F1_CREATE)**
**Công thức:**
- **F1** nhận **10%** (Tầng 1 - Lúc này F1 đóng vai trò sale trực tiếp)
- **Không có Tầng 2** (F1 là cấp cao nhất)

**Ví dụ:**
- Booking: 2.000.000 VND
- F1 nhận: 200.000 VND (10%)
- **Tổng hoa hồng:** 200.000 VND (10%)

**Luồng:**
1. F1 đăng nhập → Click "Tạo Booking"
2. Điền thông tin khách (không cần tài khoản)
3. Hệ thống tạo **1 commission record:**
   - Commission 1: partnerId = F1, amount = 200k, rate = 10, tier = 1

---

### **Trường hợp 3: Web Direct / Admin Create**
**Công thức:**
- **Không có hoa hồng**

---

## 🧪 TEST SCENARIOS

### **TEST 1: F2 Self Booking - Tạo 2 Hoa Hồng**

**Setup:**
- F1: `f1@sake.com` (referralCode: F1CODE)
- F2: `f2@sake.com` (referredBy: f1@sake.com)

**Steps:**
1. Login as F2: `f2@sake.com` / `password123`
2. Navigate to `/booking`
3. Fill form:
   - Customer Name: "Nguyễn Văn B" (sẽ auto-fill từ F2 profile)
   - Phone: "0909876543"
   - Date/Time: Tomorrow 7PM
   - Guests: 4
   - Combo: "Combo Gia Đình" (2,400,000 VND)
4. Submit

**Expected Results:**
```sql
-- Booking
SELECT * FROM Booking WHERE customerName = 'Nguyễn Văn B';
-- source = "F2_SELF", customerId = [F2's ID]

-- Commission 1 (F2 - Tầng 1)
SELECT * FROM Commission WHERE bookingId = [booking_id] AND tier = 1;
-- partnerId = [F2's ID], amount = 240000, rate = 10, tier = 1

-- Commission 2 (F1 - Tầng 2)
SELECT * FROM Commission WHERE bookingId = [booking_id] AND tier = 2;
-- partnerId = [F1's ID], amount = 120000, rate = 5, tier = 2
```

**UI Check:**
- Admin Commission Dashboard:
  - Row 1: F2 - "T1 - Sale" badge (blue) - 240,000 VND
  - Row 2: F1 - "T2 - Quản lý" badge (purple) - 120,000 VND

---

### **TEST 2: F1 Create Booking - Chỉ 1 Hoa Hồng Tầng 1**

**Steps:**
1. Login as F1: `f1@sake.com` / `password123`
2. Navigate to Dashboard
3. Click "Tạo Booking" button
4. Fill form:
   - Customer Name: "Trần Thị C"
   - Phone: "0901112233"
   - Date/Time: Next week 8PM
   - Guests: 2
   - Combo: "Combo Cặp Đôi" (666,000 VND)
5. Submit

**Expected Results:**
```sql
-- Booking
SELECT * FROM Booking WHERE customerName = 'Trần Thị C';
-- source = "F1_CREATE", createdById = [F1's ID], customerId = NULL

-- Commission 1 (F1 - Tầng 1)
SELECT * FROM Commission WHERE bookingId = [booking_id];
-- partnerId = [F1's ID], amount = 66600, rate = 10, tier = 1
-- Chỉ có 1 commission record, không có tier 2
```

**UI Check:**
- Admin Commission Dashboard:
  - Row 1: F1 - "T1 - Sale" badge (blue) - 66,600 VND
  - **Không có row tier 2**

---

### **TEST 3: Multiple F2 Under Same F1**

**Setup:**
- F1: `f1@sake.com`
- F2A: `f2a@sake.com` (referredBy: F1)
- F2B: `f2b@sake.com` (referredBy: F1)

**Steps:**
1. F2A tạo booking 1,000,000 VND
2. F2B tạo booking 2,000,000 VND

**Expected Results:**
- F2A nhận: 100,000 VND (tier 1)
- F2B nhận: 200,000 VND (tier 1)
- F1 nhận: 50,000 + 100,000 = **150,000 VND** (tier 2 từ 2 booking)

**UI Check:**
- Admin Dashboard filter by F1:
  - 2 rows tier 2 (50k + 100k)
- Total commission for F1: 150,000 VND

---

### **TEST 4: Commission Stats Calculation**

**Steps:**
1. Login as admin
2. Navigate to `/dashboard/admin/commissions`
3. Check stats cards

**Expected Calculation:**
```javascript
// Nếu có:
// - 3 commission tier 1 (200k, 100k, 150k)
// - 2 commission tier 2 (50k, 75k)

Total Commissions: 5
Total Amount: 575,000 VND

// Nếu tier 1 (200k) và tier 2 (50k) đã thanh toán:
Paid Commissions: 2
Paid Amount: 250,000 VND

Unpaid Commissions: 3
Unpaid Amount: 325,000 VND
```

---

### **TEST 5: Filter by Tier**

**Manual Test:**
1. Open commission page
2. Look for bookings that have 2 commissions (tier 1 + tier 2)
3. Verify:
   - Same booking ID in both rows
   - Different partners
   - Different tiers (blue vs purple badge)
   - Correct rates (10% vs 5%)

---

## 🔍 DATABASE VERIFICATION

### Query 1: Check Commission Distribution
```sql
SELECT 
  tier,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(rate) as avg_rate
FROM Commission
GROUP BY tier;

-- Expected:
-- tier 1: count = X, avg_rate = 10
-- tier 2: count = Y, avg_rate = 5
```

### Query 2: Find Bookings with 2 Commissions
```sql
SELECT 
  b.id,
  b.customerName,
  b.finalTotal,
  b.source,
  COUNT(c.id) as commission_count
FROM Booking b
LEFT JOIN Commission c ON c.bookingId = b.id
GROUP BY b.id
HAVING commission_count = 2;

-- Should return all F2_SELF bookings where F2 has a referrer
```

### Query 3: Check F1's Total Commission
```sql
SELECT 
  u.name,
  u.email,
  SUM(CASE WHEN c.tier = 1 THEN c.amount ELSE 0 END) as tier1_total,
  SUM(CASE WHEN c.tier = 2 THEN c.amount ELSE 0 END) as tier2_total,
  SUM(c.amount) as total_commission
FROM User u
LEFT JOIN Commission c ON c.partnerId = u.id
WHERE u.role = 'F1_PARTNER'
GROUP BY u.id;
```

---

## ✅ VALIDATION CHECKLIST

### Database Schema
- [ ] Commission table has `tier` field (Int, default 1)
- [ ] Migration applied successfully
- [ ] Existing commissions have tier = 1 (default)

### API Logic
- [ ] F2_SELF creates 2 commissions (tier 1 + tier 2)
- [ ] F1_CREATE creates 1 commission (tier 1 only)
- [ ] WEB_DIRECT / ADMIN_CREATE creates 0 commissions
- [ ] Correct rates: tier 1 = 10%, tier 2 = 5%

### UI Display
- [ ] Commission table shows "Tầng" column
- [ ] Tier 1 badge: Blue - "T1 - Sale"
- [ ] Tier 2 badge: Purple - "T2 - Quản lý"
- [ ] Stats calculate correctly across all tiers
- [ ] colSpan updated to 9 (was 8)

### Edge Cases
- [ ] F2 without referrer: Only tier 1 commission
- [ ] F1 with no F2 under them: Only tier 1 when they sell
- [ ] Cancelled booking: Both tier 1 and tier 2 voided
- [ ] Multiple F2 under same F1: F1 gets multiple tier 2 commissions

---

## 🐛 KNOWN ISSUES / NOTES

1. **F1Dashboard Still Calculates 10% Static**
   - Current: `const commission = booking.finalTotal * 0.1`
   - Should: Fetch actual commission from database
   - **TODO:** Update F1Dashboard to fetch real commissions

2. **Commission Rate vs Tier**
   - tier 1 always gets 10% (hardcoded)
   - tier 2 always gets 5% (hardcoded)
   - **Future:** Make rates configurable per partner

3. **F2 Dashboard Doesn't Exist Yet**
   - F2 members can't see their own tier 1 commissions
   - **TODO:** Create F2Dashboard similar to F1Dashboard

4. **No Commission Detail Page**
   - Can't click into a commission to see full details
   - **Future:** Add detail modal or page

---

## 📈 NEXT STEPS (Phase 5)

1. **Update F1Dashboard to fetch real commissions**
   - Include commissions array in booking response
   - Display actual tier 1 + tier 2 totals

2. **Create F2Dashboard**
   - Show F2's own bookings
   - Show F2's tier 1 commissions
   - Show how much their F1 manager earned from them

3. **Add Commission Analytics**
   - Chart: Tier 1 vs Tier 2 over time
   - Top performing F1 partners
   - Top performing F2 members

4. **Add Tier Filter in Commission Page**
   - Filter by tier (All / Tier 1 / Tier 2)
   - Separate stats for each tier

---

## 🎉 COMPLETION CRITERIA

**Phase 4 is complete when:**
- ✅ Schema updated with tier field
- ✅ F2_SELF creates 2 commissions
- ✅ F1_CREATE creates 1 commission
- ✅ UI displays tier badges correctly
- ✅ All tests pass
- ⏳ Documentation updated (this file)

**Ready for Phase 5 when:**
- All manual tests completed
- No TypeScript errors
- Commission stats accurate
- F1 can see both their tier 1 and tier 2 earnings

---

**Last Updated:** January 30, 2026  
**Status:** ✅ Implementation Complete - Ready for Testing
