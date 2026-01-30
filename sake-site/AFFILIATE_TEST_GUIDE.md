# AFFILIATE SYSTEM TEST GUIDE

## ✅ COMPLETED FEATURES

### 1. F1 Partner - Create Booking for Customers
**Files Modified:**
- `/api/bookings/route.ts` - Added F1_CREATE source handling
- `/components/booking/BookingForm.tsx` - Added `isF1Creating` prop
- `/components/dashboard/F1Dashboard.tsx` - Added Create Booking button and modal

**Functionality:**
- F1 partners can create bookings for their customers
- Booking source is automatically set to `F1_CREATE`
- Commission is auto-generated with rate: 10% of finalTotal
- Commission is linked to the F1 partner who created the booking

---

### 2. Admin Commission Management Dashboard
**Files Created:**
- `/dashboard/admin/commissions/page.tsx` - Full commission management UI
- `/app/dashboard/admin/layout.tsx` - Added "Hoa Hồng" menu link

**Features:**
- View all commissions with detailed stats
- Filter by partner (dropdown)
- Filter by payment status (all/paid/unpaid)
- Stats cards showing:
  - Total commissions count + amount
  - Paid commissions count + amount
  - Unpaid commissions count + amount
- Table showing:
  - Partner info (name, email)
  - Customer name
  - Booking date
  - Booking total
  - Commission rate
  - Commission amount
  - Payment status
  - Action button to mark as paid

---

### 3. Commission API Routes
**Files Created:**
- `/api/commissions/route.ts` - GET endpoint
- `/api/commissions/[id]/route.ts` - PATCH endpoint

**Features:**
- `GET /api/commissions`
  - Admin: See all commissions
  - F1 Partner: See only their own commissions
  - Returns stats + commission list
  - Includes partner, booking, and customer info

- `PATCH /api/commissions/[id]`
  - Admin only
  - Update `isPaid` status
  - Validates commission exists before updating

---

### 4. Cancelled Booking Commission Handling
**Files Modified:**
- `/api/bookings/[id]/route.ts` - PATCH endpoint for status update

**Functionality:**
- When booking status is changed to `CANCELLED` or `NO_SHOW`
- All related commissions are automatically voided (isPaid = false)
- Ensures commission integrity with booking status

---

## 📋 TEST SCENARIOS

### Scenario 1: F1 Partner Creates Booking for Customer

**Steps:**
1. Login as F1 partner: `f1@sake.com` / `password123`
2. Go to Dashboard (auto-redirect)
3. Click "Tạo Booking" button in the header
4. Fill booking form:
   - Customer Name: "Nguyễn Văn A"
   - Phone: "0901234567"
   - Email: "customer@test.com"
   - Date/Time: Tomorrow at 7:00 PM
   - Guests: 4 người
   - Combo: "Combo Gia Đình" (2,400,000 VND)
   - Has Deposit: Yes
5. Submit form

**Expected Results:**
- ✅ Booking created successfully
- ✅ Toast: "Đã tạo booking thành công! Hoa hồng sẽ được tính tự động."
- ✅ New booking appears in F1's booking list
- ✅ Commission row shows: 240,000 VND (10% of 2,400,000)
- ✅ Commission status: "Chưa thanh toán"
- ✅ Source: F1_CREATE
- ✅ Modal closes and table refreshes

**Database Check:**
```sql
SELECT * FROM Booking WHERE customerName = 'Nguyễn Văn A';
-- Should show: source = "F1_CREATE", createdById = F1's userId

SELECT * FROM Commission WHERE bookingId = [booking_id];
-- Should show: partnerId = F1's userId, amount = 240000, rate = 10, isPaid = false
```

---

### Scenario 2: F2 Member Self-Booking with Referral Commission

**Steps:**
1. Login as F2 member: `f2@sake.com` / `password123`
2. Navigate to `/booking`
3. Fill booking form:
   - Customer Name: "Trần Thị B"
   - Phone: "0909876543"
   - Email: "f2@sake.com"
   - Date/Time: Next week at 8:00 PM
   - Guests: 2 người
   - Combo: "Combo Cặp Đôi" (666,000 VND)
   - Has Deposit: No
   - Referral Code: Leave empty (assuming F2 was referred by F1)
4. Submit

**Expected Results:**
- ✅ Booking created successfully
- ✅ Source: F2_SELF
- ✅ Commission created for F2's referrer (F1) = 66,600 VND (10%)
- ✅ customerId = F2's userId

**Database Check:**
```sql
SELECT * FROM User WHERE email = 'f2@sake.com';
-- Check referredById field

SELECT * FROM Commission WHERE bookingId = [booking_id];
-- Should show: partnerId = referredById (F1), amount = 66600
```

---

### Scenario 3: Admin Marks Commission as Paid

**Steps:**
1. Login as admin: `admin@sake.com` / `admin123`
2. Navigate to `/dashboard/admin/commissions`
3. Verify stats cards update correctly
4. Find an unpaid commission row
5. Click "Đánh dấu đã trả" button
6. Wait for toast confirmation

**Expected Results:**
- ✅ Toast: "Đã đánh dấu đã thanh toán"
- ✅ Commission status changes to "Đã thanh toán" (green badge)
- ✅ Action button disappears
- ✅ Stats cards update:
  - Unpaid count decreases by 1
  - Paid count increases by 1
  - Amounts shift correctly

**Database Check:**
```sql
SELECT * FROM Commission WHERE id = [commission_id];
-- Should show: isPaid = true
```

---

### Scenario 4: Cancel Booking Voids Commission

**Steps:**
1. Login as admin: `admin@sake.com` / `admin123`
2. Go to `/dashboard/admin` (Booking Dashboard)
3. Find a booking with commission (from Scenario 1 or 2)
4. Open booking actions dropdown
5. Change status to "CANCELLED"
6. Confirm action

**Expected Results:**
- ✅ Booking status changes to "CANCELLED"
- ✅ Related commission isPaid set to false (voided)
- ✅ If commission was paid, it's marked unpaid

**Database Check:**
```sql
SELECT * FROM Booking WHERE id = [booking_id];
-- Should show: status = "CANCELLED"

SELECT * FROM Commission WHERE bookingId = [booking_id];
-- Should show: isPaid = false
```

---

### Scenario 5: Filter Commissions by Partner

**Steps:**
1. Login as admin
2. Navigate to `/dashboard/admin/commissions`
3. In "Lọc theo Đối tác" dropdown, select a specific F1 partner
4. Verify table updates

**Expected Results:**
- ✅ Table only shows commissions for selected partner
- ✅ Stats cards recalculate for filtered data
- ✅ Change back to "Tất cả đối tác" shows all commissions again

---

### Scenario 6: Filter Commissions by Payment Status

**Steps:**
1. In commissions page, select "Chưa thanh toán" in status filter
2. Verify only unpaid commissions show
3. Select "Đã thanh toán"
4. Verify only paid commissions show
5. Select "Tất cả"

**Expected Results:**
- ✅ Filters work correctly
- ✅ Table updates in real-time
- ✅ No page refresh needed

---

## 🔍 EDGE CASES TO TEST

### Edge Case 1: Web Direct Booking (No Commission)
- Customer books directly from `/booking` without being logged in
- **Expected:** Booking created with source=WEB_DIRECT, NO commission generated

### Edge Case 2: F1 Creates Booking with Referral Code
- F1 creates booking and enters another F1's referral code
- **Expected:** Commission still goes to the F1 who created the booking (not the referral code owner)

### Edge Case 3: Admin Creates Booking
- Admin manually creates booking from dashboard
- **Expected:** source=ADMIN_CREATE, NO commission generated

### Edge Case 4: Multiple Filters Combined
- Filter by specific partner + unpaid status
- **Expected:** Shows only unpaid commissions for that partner

### Edge Case 5: Mark Paid Then Cancel Booking
1. Mark commission as paid
2. Cancel the related booking
- **Expected:** Commission isPaid resets to false

---

## 📊 DATABASE SCHEMA VERIFICATION

### Booking Model
```prisma
model Booking {
  source       BookingSource  // WEB_DIRECT, F2_SELF, F1_CREATE, ADMIN_CREATE
  customerId   String?        // Null for F1_CREATE (guest bookings)
  createdById  String?        // F1 or Admin who created the booking
  commissions  Commission[]
}
```

### Commission Model
```prisma
model Commission {
  partnerId    String         // F1 partner earning the commission
  bookingId    String
  amount       Int            // Commission amount in VND
  rate         Int            // Percentage rate (usually 10)
  isPaid       Boolean        // Payment status
}
```

---

## 🎯 COMMISSION CALCULATION LOGIC

### Current Implementation:
1. **F2_SELF Booking:**
   - Check if F2 member has a referredBy
   - If yes: Commission = finalTotal × 10% for the referrer
   - If no: No commission

2. **F1_CREATE Booking:**
   - Commission = finalTotal × 10% for the F1 partner
   - Always generated

3. **WEB_DIRECT & ADMIN_CREATE:**
   - No commission generated

### Formula:
```javascript
commissionAmount = Math.round(booking.finalTotal * 10 / 100);
```

---

## 🚀 NEXT STEPS (OPTIONAL ENHANCEMENTS)

1. **Commission Export:**
   - Add CSV/Excel export button for accounting
   - Filter by date range

2. **Payment History:**
   - Track payment dates
   - Payment method field
   - Payment receipt upload

3. **Commission Tiers:**
   - Different rates for different partners
   - Bonus commissions for high performers

4. **F1 Dashboard Commission View:**
   - Allow F1 partners to see their own commissions
   - Total earnings summary
   - Monthly breakdown

5. **Notification System:**
   - Email F1 when commission is generated
   - Email when commission is marked as paid

6. **Commission Approval Workflow:**
   - Admin must approve commissions before payment
   - Add "pending approval" status

---

## ✅ MANUAL TESTING CHECKLIST

- [ ] F1 can create bookings for customers
- [ ] Commission auto-generates on F1_CREATE
- [ ] Commission auto-generates on F2_SELF (if referrer exists)
- [ ] Admin can view all commissions
- [ ] Admin can mark commissions as paid
- [ ] Stats cards calculate correctly
- [ ] Partner filter works
- [ ] Status filter works
- [ ] Cancelled bookings void commissions
- [ ] NO_SHOW bookings void commissions
- [ ] F1 Dashboard shows correct commission amounts
- [ ] BookingForm modal opens and closes correctly
- [ ] Toast notifications show for all actions
- [ ] No TypeScript errors in console
- [ ] No console errors during testing
- [ ] Mobile responsive design works

---

## 🐛 KNOWN ISSUES / TODOS

1. ⚠️ Cookie names inconsistency:
   - Some routes use `sake_role`, `sake_user_id`
   - Others use `role`, `userId`
   - **Fix:** Standardize cookie naming across all routes

2. ⚠️ F1 booking form doesn't show customer name in F1's dashboard booking list
   - **Fix:** Already included in BookingForm, just need to verify

3. ✅ TypeScript errors fixed:
   - prisma import corrected
   - Type annotations added
   - Field name corrected (name vs fullName)

---

## 📝 TESTING NOTES

**Last Updated:** [Current Date]

**Test Environment:**
- Next.js: 16.1.4
- Database: SQLite (dev.db)
- Node.js: Latest LTS
- Browser: Chrome/Edge

**Test Users:**
- Admin: `admin@sake.com` / `admin123`
- F1 Partner: `f1@sake.com` / `password123`
- F2 Member: `f2@sake.com` / `password123`

**Test Server:** http://localhost:3000

---

**Happy Testing! 🎉**
