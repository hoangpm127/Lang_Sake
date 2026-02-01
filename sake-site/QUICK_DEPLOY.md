# 🚀 Quick Start Deployment Guide

> **Fastest path to production deployment**

---

## 🎯 Prerequisites (5 minutes)

1. **GitHub Account** - Code already pushed ✅
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **Gmail Account** - For email notifications
4. **Bank Account** - For payment QR codes
5. **Sepay Account** - For webhook (100K VND/month)

---

## 📋 Deployment Steps

### **Step 1: Deploy to Vercel** (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `Lang_Sake` repository
4. Click "Deploy"

Wait for initial deployment (will fail - expected, we need env vars)

---

### **Step 2: Setup Database** (3 minutes)

**Option A: Vercel Postgres (Recommended)**
1. In Vercel dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy connection string
4. Save for next step

**Option B: Supabase (Free)**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

---

### **Step 3: Configure Environment Variables** (5 minutes)

In Vercel dashboard → Settings → Environment Variables, add:

#### **Required Variables:**

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=admin@langsake.vn

# Bank Info
NEXT_PUBLIC_BANK_BIN=970436
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=1234567890
NEXT_PUBLIC_BANK_ACCOUNT_NAME=LANG SAKE

# Base URL (auto-filled by Vercel)
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Payment Webhook
SEPAY_API_KEY=your-sepay-api-key
```

#### **How to Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" + "Other"
5. Copy the 16-character password

#### **How to Get Sepay API Key:**
1. Register at https://sepay.vn
2. Complete verification
3. Go to Settings → API
4. Copy API Key

---

### **Step 4: Redeploy** (1 minute)

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Check "Use existing build cache" (optional)
4. Wait for deployment to complete (~2 minutes)

---

### **Step 5: Run Database Migrations** (2 minutes)

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Optional: Seed test data
npm run seed
```

**Option B: Using Vercel Dashboard**
1. Go to Settings → Functions
2. Add serverless function:
   ```typescript
   // api/migrate.ts
   import { exec } from 'child_process';
   export default (req, res) => {
     exec('npx prisma migrate deploy', (err, stdout) => {
       res.json({ success: !err, output: stdout });
     });
   };
   ```
3. Visit `https://your-app.vercel.app/api/migrate`

---

### **Step 6: Configure Webhook** (2 minutes)

1. Go to Sepay dashboard
2. Navigate to Webhook settings
3. Add webhook URL:
   ```
   https://your-app.vercel.app/api/webhooks/payment
   ```
4. Save configuration

---

### **Step 7: Test Production** (5 minutes)

1. Visit your deployed URL
2. Register test account
3. Create booking with deposit
4. Check VietQR code generated
5. Use `simulate-payment.js` to test webhook:
   ```bash
   # Update URL in script first
   node simulate-payment.js
   ```
6. Verify email received
7. Check admin dashboard for payment

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Login successful
- [ ] Booking creation works
- [ ] VietQR code displays
- [ ] Webhook processes payment
- [ ] Email notifications sent
- [ ] Admin dashboard accessible
- [ ] Analytics showing data
- [ ] No console errors

**Health Check:**
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "services": {
    "email": "configured",
    "payment": "configured",
    "bank": "configured"
  }
}
```

---

## 🔧 Common Issues & Fixes

### **Issue: Build Failed**

**Error:** `Module not found` or `Type error`

**Fix:**
```bash
# Locally test build
npm run build

# Fix errors, commit, push
git add .
git commit -m "Fix build errors"
git push
```
Vercel auto-redeploys on push.

---

### **Issue: Database Connection Failed**

**Error:** `Can't reach database server`

**Fix:**
1. Check `DATABASE_URL` format in Vercel env vars
2. Verify database is running (Vercel Postgres/Supabase)
3. Check IP whitelist (Supabase requires `0.0.0.0/0` for Vercel)

---

### **Issue: Prisma Client Not Generated**

**Error:** `Cannot find module '@prisma/client'`

**Fix:** Update `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build"
}
```
Then redeploy.

---

### **Issue: Email Not Sending**

**Error:** `Invalid login` or `Authentication failed`

**Fix:**
1. Verify Gmail App Password (not regular password)
2. Check 2-Step Verification enabled
3. Ensure `EMAIL_USER` = full email address
4. Test locally first:
   ```bash
   node -e "console.log(require('nodemailer').createTransport({...}).verify())"
   ```

---

### **Issue: Webhook Returns 404**

**Error:** Sepay shows "Webhook failed"

**Fix:**
1. Verify URL: `https://your-app.vercel.app/api/webhooks/payment` (no trailing slash)
2. Check deployment successful
3. Test endpoint:
   ```bash
   curl -X POST https://your-app.vercel.app/api/webhooks/payment \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

---

### **Issue: Environment Variables Not Working**

**Error:** `process.env.X is undefined`

**Fix:**
1. Ensure variables saved in Vercel dashboard
2. Check "Production" environment selected
3. Redeploy after adding new variables
4. For `NEXT_PUBLIC_*` vars, rebuild required

---

## 🎯 Production Optimization

### **Enable Analytics** (1 minute)
1. Vercel dashboard → Analytics tab
2. Click "Enable Analytics"
3. View real-time traffic, performance

### **Custom Domain** (5 minutes)
1. Vercel dashboard → Settings → Domains
2. Add domain (e.g., `langsake.vn`)
3. Update DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~10 minutes)

### **Enable Monitoring** (Optional)
1. Install Sentry: `npm install @sentry/nextjs`
2. Run: `npx @sentry/wizard@latest -i nextjs`
3. Add `SENTRY_DSN` to Vercel env vars

---

## 📊 Expected Costs

| Service | Cost | Required |
|---------|------|----------|
| Vercel (Hobby) | Free | ✅ |
| Vercel Postgres | $0.25/GB | ✅ |
| Sepay Webhook | ~100K VND/month | ✅ |
| Custom Domain | ~$12/year | Optional |
| Email (Gmail) | Free | ✅ |
| **Total** | **~$3-5/month** | |

**Alternative Free Option:**
- Use Supabase (free PostgreSQL)
- Use Vercel (free hosting)
- Manual payment confirmation (no webhook)
- **Total: $0/month** (manual work required)

---

## 🚀 Launch!

**You're ready when:**
- ✅ Health check returns "healthy"
- ✅ Test booking successful
- ✅ Payment webhook working
- ✅ Emails sending
- ✅ Admin dashboard accessible

**Final Steps:**
1. Create admin account
2. Create test F1/F2 accounts
3. Announce launch! 🎉
4. Monitor for first 24 hours

---

## 📞 Need Help?

**Issues during deployment?**
1. Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Review Vercel logs (Dashboard → Deployments → View Logs)
3. Test locally first: `npm run build && npm start`

**All documentation:**
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Full details
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Feature overview
- [PAYMENT_SETUP_GUIDE.md](./PAYMENT_SETUP_GUIDE.md) - Payment config
- Phase docs (1-8) - Implementation details

---

**Estimated Total Time:** ~25 minutes  
**Deployment Status:** 🟢 **READY**

Good luck! 🚀
